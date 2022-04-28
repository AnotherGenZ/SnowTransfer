import LocalBucket from "./LocalBucket";

/**
 * Ratelimiter used for handling the ratelimits imposed by the rest api
 * @protected
 */
class Ratelimiter {
	public buckets: { [routeKey: string]: LocalBucket; };
	public global: boolean;
	public globalReset: number;

	public constructor() {
		this.buckets = {};
		this.global = false;
		this.globalReset = 0;
	}

	/**
	 * Returns a key for saving ratelimits for routes
	 * (Taken from https://github.com/abalabahaha/eris/blob/master/lib/rest/RequestHandler.js) -> I luv u abal <3
	 * @param url url to reduce to a key something like /channels/266277541646434305/messages/266277541646434305/
	 * @param method method of the request, usual http methods like get, etc.
	 * @returns reduced url: /channels/266277541646434305/messages/:id/
	 */
	public routify(url: string, method: string): string {
		let route = url.replace(/\/([a-z-]+)\/(?:\d+)/g, function (match, p) {
			return p === "channels" || p === "guilds" || p === "webhooks" ? match : `/${p}/:id`;
		}).replace(/\/reactions\/[^/]+/g, "/reactions/:id").replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, "/webhooks/$1/:token");
		if (method.toUpperCase() === "DELETE" && route.endsWith("/messages/:id")) route = method + route; // Delete Messsage endpoint has its own ratelimit
		return route;
	}

	/**
	 * Queue a rest call to be executed
	 * @param fn function to call once the ratelimit is ready
	 * @param url Endpoint of the request
	 * @param method Http method used by the request
	 */
	public queue(fn: (bucket: import("./LocalBucket")) => any, url: string, method: string) {
		const routeKey = this.routify(url, method);
		if (!this.buckets[routeKey]) this.buckets[routeKey] = new LocalBucket(this, routeKey);
		this.buckets[routeKey].queue(fn);
	}
}

export = Ratelimiter;
