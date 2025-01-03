/* eslint-disable no-async-promise-executor */

import fs = require("fs");
import path = require("path");
import { EventEmitter } from "events";
import crypto = require("crypto");

import { fetch, FormData, Headers, Response } from "undici"; // Not using global.fetch yet until the Node ecosystem matures

import Endpoints = require("./Endpoints");
const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), { encoding: "utf8" })); // otherwise, the json was included in the build
import Constants = require("./Constants");

export type HTTPMethod = "get" | "post" | "patch" | "head" | "put" | "delete" | "connect" | "options" | "trace";

export type RESTPostAPIAttachmentsRefreshURLsResult = {
	refreshed_urls: Array<{
		original: string;
		refreshed: string;
	}>
}

// const applicationJSONRegex = /application\/json/;
const routeRegex = /\/([a-z-]+)\/(?:\d{17,19})/g;
const reactionsRegex = /\/reactions\/[^/]+/g;
const reactionsUserRegex = /\/reactions\/:id\/[^/]+/g;
const webhooksRegex = /^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/;
const isMessageEndpointRegex = /\/messages\/:id$/;
const isGuildChannelsRegex = /\/guilds\/\d+\/channels$/;

const disallowedBodyMethods = new Set(["head", "get"]);

/**
 * @since 0.3.0
 */
export class DiscordAPIError extends Error {
	public code: number;
	public httpStatus: number;

	public constructor(public path: string, error: { message?: string; code?: number; }, public method: HTTPMethod, status: number) {
		super();
		this.name = "DiscordAPIError";
		this.message = error.message ?? String(error);
		this.code = error.code ?? 4000;
		this.httpStatus = status;
	}
}

/**
 * Ratelimiter used for handling the ratelimits imposed by the rest api
 * @since 0.1.0
 * @protected
 */
export class Ratelimiter<B extends typeof GlobalBucket = typeof GlobalBucket> {
	/**
	 * An object of Buckets that store rate limit info
	 */
	public buckets: { [routeKey: string]: InstanceType<B>; } = {};
	/**
	 * If you're being globally rate limited
	 */
	private _global = false;
	/**
	 * Timeframe in milliseconds until when the global rate limit resets
	 */
	public globalReset = 0;
	/**
	 * Timeout that resets the global ratelimit once the timeframe has passed
	 */
	public globalResetTimeout: NodeJS.Timeout | null = null;
	/**
	 * The constructor function to call new on when creating buckets to cache and use
	 */
	public BucketConstructor = GlobalBucket as B;

	/**
	 * If you're being globally rate limited
	 */
	public get global() {
		return this._global;
	}

	/**
	 * If you're being globally rate limited
	 */
	public set global(value) {
		if (value && this.globalReset !== 0) {
			if (this.globalResetTimeout) clearTimeout(this.globalResetTimeout);
			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const instance = this;
			this.globalResetTimeout = setTimeout(() => {
				instance.global = false;
			}, this.globalReset).unref();
		} else {
			if (this.globalResetTimeout) clearTimeout(this.globalResetTimeout);
			this.globalResetTimeout = null;
			this.globalReset = 0;
			for (const bkt of Object.values(this.buckets)) {
				bkt.checkQueue();
			}
		}
		this._global = value;
	}

	/**
	 * Returns a key for saving ratelimits for routes
	 * (Taken from https://github.com/abalabahaha/eris/blob/master/lib/rest/RequestHandler.js) -> I luv u abal <3
	 * @since 0.1.0
	 * @param url url to reduce to a key something like /channels/266277541646434305/messages/266277541646434305/
	 * @param method method of the request, usual http methods like get, etc.
	 * @returns reduced url: /channels/266277541646434305/messages/:id/
	 */
	public routify(url: string, method: string): string {
		let route = url.replace(routeRegex, function (match, p: string) {
			return p === "channels" || p === "guilds" || p === "webhooks" ? match : `/${p}/:id`;
		}).replace(reactionsRegex, "/reactions/:id").replace(reactionsUserRegex, "/reactions/:id/:userID").replace(webhooksRegex, "/webhooks/$1/:token");

		if (method.toUpperCase() === "DELETE" && isMessageEndpointRegex.test(route)) route = method + route;
		else if (method.toUpperCase() === "GET" && isGuildChannelsRegex.test(route)) route = "/guilds/:id/channels";

		if (method === "PUT" || method === "DELETE") {
			const index = route.indexOf("/reactions");
			if (index !== -1) route = "MODIFY" + route.slice(0, index + 10);
		}
		return route;
	}

	/**
	 * Queue a rest call to be executed
	 * @since 0.1.0
	 * @param fn function to call once the ratelimit is ready
	 * @param url Endpoint of the request
	 * @param method Http method used by the request
	 */
	public queue<T>(fn: (bucket: InstanceType<B>) => T, url: string, method: string): Promise<T> {
		const routeKey = this.routify(url, method);
		this.buckets[routeKey] ??= new this.BucketConstructor(this, routeKey) as InstanceType<B>;
		return this.buckets[routeKey].queue(fn);
	}
}

/**
 * Bucket used for saving ratelimits
 * @since 0.1.0
 * @protected
 */
export class LocalBucket {
	/**
	 * Remaining amount of executions during the current timeframe
	 */
	public remaining: number;
	/**
	 * array of functions waiting to be executed
	 */
	public fnQueue: Array<() => any> = [];
	/**
	 * Timeout that calls the reset function once the timeframe passed
	 */
	public resetTimeout: NodeJS.Timeout | null = null;

	/**
	 * Create a new base bucket
	 * @param limit Number of functions that may be executed during the timeframe set in reset
	 * @param reset Timeframe in milliseconds until the ratelimit resets after first
	 * @param remaining Remaining amount of executions during the current timeframe
	 */
	public constructor(public limit = 5, public reset = 5000, remaining?: number) {
		this.remaining = remaining ?? limit;
	}

	/**
	 * Queue a function to be executed
	 * @since 0.1.0
	 * @param fn function to be executed
	 * @returns Result of the function if any
	 */
	public queue<T>(fn: (bucket: this) => T): Promise<T> {
		return new Promise((res, rej) => {
			const wrapFn = () => {
				this.remaining--; // ratelimiter queue call expects remaining to be --'d first
				if (!this.resetTimeout) this.makeResetTimeout(this.reset);
				if (this.remaining !== 0) setImmediate(() => this.checkQueue()); // run functions on separate ticks
				let result;
				try {
					result = fn(this);
				} catch (e) {
					return rej(e as Error);
				}
				return res(result);
			};
			this.fnQueue.push(wrapFn);
			this.checkQueue();
		});
	}

	/**
	 * Reset/make the timeout of this bucket
	 * @since 0.8.3
	 * @param durationMS Timeframe in milliseconds until the ratelimit resets after
	 */
	public makeResetTimeout(durationMS: number): void {
		if (this.resetTimeout) clearTimeout(this.resetTimeout);
		this.resetTimeout = setTimeout(() => this.resetRemaining(), durationMS);
	}

	/**
	 * Check if there are any functions in the queue that haven't been executed yet
	 * @since 0.1.0
	 */
	public checkQueue(): void {
		if (this.fnQueue.length && this.remaining !== 0) {
			const queuedFunc = this.fnQueue.splice(0, 1)[0];
			queuedFunc();
		}
	}

	/**
	 * Reset the remaining tokens to the base limit
	 * @since 0.1.0
	 */
	public resetRemaining(): void {
		this.remaining = this.limit;
		if (this.resetTimeout) {
			clearTimeout(this.resetTimeout);
			this.resetTimeout = null;
		}
		if (this.fnQueue.length) this.checkQueue();
	}

	/**
	 * Clear the current queue of events to be sent
	 * @since 0.1.0
	 */
	public dropQueue(): void {
		this.fnQueue.length = 0;
	}
}

/**
 * Extended bucket that respects global ratelimits
 * @since 0.10.0
 * @protected
 */
export class GlobalBucket extends LocalBucket {
	/**
	 * Create a new bucket that respects global rate limits
	 * @param ratelimiter ratelimiter used for ratelimiting requests. Assigned by ratelimiter
	 * @param routeKey Key used internally to routify requests. Assigned by ratelimiter
	 */
	public constructor(public ratelimiter: Ratelimiter, public routeKey: string) {
		super(5, 5000, 1);
	}

	/**
	 * Check if there are any functions in the queue that haven't been executed yet
	 * @since 0.10.0
	 */
	public checkQueue(): void {
		if (this.ratelimiter.global) return;
		super.checkQueue();
	}

	/**
	 * Reset the remaining tokens to the base limit
	 * @since 0.10.0
	 */
	public resetRemaining(): void {
		if (!this.fnQueue.length) delete this.ratelimiter.buckets[this.routeKey];
		super.resetRemaining();
	}
}

export type HandlerEvents = {
	request: [string, { endpoint: string, method: HTTPMethod, dataType: "json" | "multipart", data: any; }];
	done: [string, Response];
	requestError: [string, Error];
	rateLimit: [{ timeout: number; remaining: number; limit: number; method: HTTPMethod; path: string; route: string; }];
}

export interface RequestHandler {
	addListener<E extends keyof HandlerEvents>(event: E, listener: (...args: HandlerEvents[E]) => any): this;
	emit<E extends keyof HandlerEvents>(event: E, ...args: HandlerEvents[E]): boolean;
	eventNames(): Array<keyof HandlerEvents>;
	listenerCount(event: keyof HandlerEvents): number;
	listeners(event: keyof HandlerEvents): Array<(...args: Array<any>) => any>;
	off<E extends keyof HandlerEvents>(event: E, listener: (...args: HandlerEvents[E]) => any): this;
	on<E extends keyof HandlerEvents>(event: E, listener: (...args: HandlerEvents[E]) => any): this;
	once<E extends keyof HandlerEvents>(event: E, listener: (...args: HandlerEvents[E]) => any): this;
	prependListener<E extends keyof HandlerEvents>(event: E, listener: (...args: HandlerEvents[E]) => any): this;
	prependOnceListener<E extends keyof HandlerEvents>(event: E, listener: (...args: HandlerEvents[E]) => any): this;
	rawListeners(event: keyof HandlerEvents): Array<(...args: Array<any>) => any>;
	removeAllListeners(event?: keyof HandlerEvents): this;
	removeListener<E extends keyof HandlerEvents>(event: E, listener: (...args: HandlerEvents[E]) => any): this;
}

/**
 * Request Handler class
 * @since 0.1.0
 */
export class RequestHandler extends EventEmitter {
	public options: {
		/** The base URL to use when making requests. Defaults to https://discord.com */
		baseHost: string;
		/** The base path of the base URL to use for the API. Defaults to /api/v${Constants.REST_API_VERSION} */
		baseURL: string;
		/** If rate limit buckets should be ignored */
		bypassBuckets: boolean;
		/** If failed requests that can be retried should be retried, up to retryLimit times. */
		retryFailed: boolean;
		/** How many times requests should be retried if they fail and can be retried. */
		retryLimit: number;
		headers: { Authorization?: string; "User-Agent": string; }
	};
	public latency: number;
	public apiURL: string;

	/**
	 * Create a new request handler
	 * @param ratelimiter ratelimiter to use for ratelimiting requests
	 * @param options options
	 */
	public constructor(public ratelimiter: Ratelimiter, options?: { token?: string; } & Partial<Omit<RequestHandler["options"], "headers">>) {
		super();

		this.options = {
			baseHost: options?.baseHost ?? Endpoints.BASE_HOST,
			baseURL: options?.baseURL ?? Endpoints.BASE_URL,
			bypassBuckets: options?.bypassBuckets ?? false,
			retryFailed: options?.retryFailed ?? false,
			retryLimit: options?.retryLimit ?? Constants.DEFAULT_RETRY_LIMIT,
			headers: {
				"User-Agent": `Discordbot (https://github.com/DasWolke/SnowTransfer, ${version}) Node.js/${process.version}`
			}
		};
		if (options?.token) this.options.headers.Authorization = options.token;

		this.apiURL = this.options.baseHost + Endpoints.BASE_URL;
		this.latency = 500;
	}

	/**
	 * Request a route from the discord api
	 * @since 0.1.0
	 * @param endpoint endpoint to request
	 * @param params URL query parameters to add on to the URL
	 * @param method http method to use
	 * @param dataType type of the data being sent
	 * @param data data to send, if any
	 * @returns Result of the request
	 */
	public request<T extends "json" | "multipart">(endpoint: string, params: Record<string, any> = {}, method: HTTPMethod, dataType: T = "json" as T, data?: T extends "json" ? any : FormData, extraHeaders?: Record<string, string>, retries = this.options.retryLimit): Promise<any> {
		// const stack = new Error().stack as string;
		return new Promise(async (res, rej) => {
			const fn = async (bkt?: GlobalBucket | undefined) => {
				const reqID = crypto.randomBytes(20).toString("hex");
				try {
					this.emit("request", reqID, { endpoint, method, dataType, data: data ?? {} });

					const before = Date.now();

					let request: Response;
					switch (dataType) {
					case "json":
						request = await this._request(endpoint, params, method, data, extraHeaders);
						break;
					case "multipart":
						if (!data) throw new Error("No multipart data");
						request = await this._multiPartRequest(endpoint, params, method, data, extraHeaders);
						break;
					default:
						throw new Error("Forbidden dataType. Use json or multipart or ensure multipart has FormData");
					}

					this.latency = Date.now() - before;

					if (bkt) this._applyRatelimitHeaders(bkt, request.headers);

					if (request.status && !Constants.OK_STATUS_CODES.has(request.status) && request.status !== 429) {
						if (this.options.retryFailed && !Constants.DO_NOT_RETRY_STATUS_CODES.has(request.status) && retries !== 0) return this.request(endpoint, params, method, dataType, data, extraHeaders, retries--).then(res).catch(rej);
						throw new DiscordAPIError(
							endpoint,
							{ message: await request.text() },
							method,
							request.status
						);
					}

					if (request.status === 429) {
						if (!this.ratelimiter.global) {
							const b = await request.json() as any; // Discord says it will be a JSON, so if there's an error, sucks
							if (b.reset_after !== undefined) this.ratelimiter.globalReset = b.reset_after * 1000;
							else this.ratelimiter.globalReset = 1000; // Should realistically never happen, but you never know
							if (b.global !== undefined) this.ratelimiter.global = b.global;
						}
						this.emit("rateLimit", {
							timeout: bkt ? bkt.reset : 0,
							remaining: bkt ? bkt.remaining : Infinity,
							limit: bkt ? bkt.limit : Infinity,
							method: method,
							path: endpoint,
							route: bkt ? bkt.routeKey : this.ratelimiter.routify(endpoint, method)
						});
						throw new DiscordAPIError(endpoint, { message: "You're being ratelimited", code: 429 }, method, request.status);
					}

					this.emit("done", reqID, request);

					if (request.body) {
						let b: any;
						try {
							b = await request.json();
						} catch {
							return res(undefined);
						}
						return res(b);
					} else return res(undefined);
				} catch (error) {
					// if (error && error.stack) error.stack = stack;
					this.emit("requestError", reqID, error);
					return rej(error as Error);
				}
			};

			if (this.options.bypassBuckets) fn();
			else this.ratelimiter.queue(fn, endpoint, method);
		});
	}

	/**
	 * Apply the received ratelimit headers to the ratelimit bucket
	 * @since 0.1.0
	 * @param bkt Ratelimit bucket to apply the headers to
	 * @param headers Http headers received from discord
	 */
	private _applyRatelimitHeaders(bkt: GlobalBucket, headers: Headers): void {
		const remaining = headers.get("x-ratelimit-remaining");
		const limit = headers.get("x-ratelimit-limit");
		const resetAfter = headers.get("x-ratelimit-reset-after");

		if (remaining) bkt.remaining = parseInt(remaining);
		if (limit) bkt.limit = parseInt(limit);
		if (resetAfter) {
			bkt.reset = parseFloat(resetAfter) * 1000;
			bkt.makeResetTimeout(bkt.reset);
		}
	}

	/**
	 * Execute a normal json request
	 * @since 0.1.0
	 * @param endpoint Endpoint to use
	 * @param params URL query parameters to add on to the URL
	 * @param data Data to send
	 * @returns Result of the request
	 */
	private async _request(endpoint: string, params: Record<string, any> = {}, method: HTTPMethod, data?: any, extraHeaders?: Record<string, string>): Promise<Response> {
		const headers = { ...this.options.headers, ...extraHeaders };
		if (typeof data !== "string" && data?.reason) {
			headers["X-Audit-Log-Reason"] = encodeURIComponent(data.reason);
			delete data.reason;
		}

		let body: string | undefined = undefined;
		if (!disallowedBodyMethods.has(method)) {
			if (typeof data === "object") body = JSON.stringify(data);
			else body = String(data);
		}

		headers["Content-Type"] = "application/json";

		return fetch(`${this.apiURL}${endpoint}${appendQuery(params)}`, {
			method: method.toUpperCase(),
			headers,
			body
		});
	}

	/**
	 * Execute a multipart/form-data request
	 * @since 0.1.0
	 * @param endpoint Endpoint to use
	 * @param params URL query parameters to add on to the URL
	 * @param method Http Method to use
	 * @param data data to send
	 * @returns Result of the request
	 */
	private async _multiPartRequest(endpoint: string, params: Record<string, any> = {}, method: HTTPMethod, data: FormData, extraHeaders?: Record<string, string>): Promise<Response> {
		const headers = { ...this.options.headers, ...extraHeaders };

		return fetch(`${this.apiURL}${endpoint}${appendQuery(params)}`, {
			method: method.toUpperCase(),
			headers,
			body: data
		});
	}
}

function appendQuery(query: Record<string, any>): string {
	let count = 0;
	for (const [key, value] of Object.entries(query)) {
		if (value == undefined) delete query[key];
		else count++;
	}

	return count > 0 ? `?${new URLSearchParams(query).toString()}` : "";
}
