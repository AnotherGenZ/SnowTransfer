import Endpoints = require("../Endpoints");
import Constants = require("../Constants");

const mentionRegex = /@([^<>@ ]*)/gsmu;

import type {
	RESTDeleteAPIWebhookResult,
	RESTDeleteAPIWebhookWithTokenMessageResult,
	RESTGetAPIChannelWebhooksResult,
	RESTGetAPIGuildWebhooksResult,
	RESTGetAPIWebhookResult,
	RESTGetAPIWebhookWithTokenMessageResult,
	RESTPatchAPIWebhookJSONBody,
	RESTPatchAPIWebhookResult,
	RESTPatchAPIWebhookWithTokenJSONBody,
	RESTPatchAPIWebhookWithTokenMessageJSONBody,
	RESTPatchAPIWebhookWithTokenMessageResult,
	RESTPatchAPIWebhookWithTokenResult,
	RESTPostAPIChannelWebhookJSONBody,
	RESTPostAPIChannelWebhookResult,
	RESTPostAPIWebhookWithTokenGitHubQuery,
	RESTPostAPIWebhookWithTokenGitHubResult,
	RESTPostAPIWebhookWithTokenGitHubWaitResult,
	RESTPostAPIWebhookWithTokenJSONBody,
	RESTPostAPIWebhookWithTokenQuery,
	RESTPostAPIWebhookWithTokenResult,
	RESTPostAPIWebhookWithTokenSlackQuery,
	RESTPostAPIWebhookWithTokenSlackResult,
	RESTPostAPIWebhookWithTokenSlackWaitResult,
	RESTPostAPIWebhookWithTokenWaitResult
} from "discord-api-types/v10";

/**
 * Methods for handling webhook interactions
 */
class WebhookMethods {
	public requestHandler: (typeof import("../RequestHandler"))["RequestHandler"]["prototype"];
	public disableEveryone: boolean;

	/**
	 * Create a new Method Handler
	 *
	 * Usually SnowTransfer creates a method handler for you, this is here for completion
	 *
	 * You can access the methods listed via `client.webhook.method`, where `client` is an initialized SnowTransfer instance
	 * @param requestHandler request handler that calls the rest api
	 * @param disableEveryone Disable [at]everyone/[at]here on outgoing messages
	 */
	public constructor(requestHandler: WebhookMethods["requestHandler"], disableEveryone: boolean) {
		this.requestHandler = requestHandler;
		this.disableEveryone = disableEveryone;
	}

	/**
	 * Create a new Webhook
	 * @param channelId Id of the channel
	 * @param data Object with webhook properties
	 * @returns [Webhook Object](https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-structure)
	 *
	 * | Permissions needed | Condition |
	 * |--------------------|-----------|
	 * | MANAGE_WEBHOOKS    | always    |
	 *
	 * @example
	 * // Create a new Webhook with the name "Webby Webhook"
	 * const client = new SnowTransfer("TOKEN")
	 * const webhookData = {
	 * 	name: "Webby Webhook"
	 * }
	 * const webhook = await client.webhook.createWebhook("channel Id", webhookData)
	 */
	public async createWebhook(channelId: string, data: RESTPostAPIChannelWebhookJSONBody): Promise<RESTPostAPIChannelWebhookResult> {
		return this.requestHandler.request(Endpoints.CHANNEL_WEBHOOKS(channelId), "post", "json", data);
	}

	/**
	 * Get all webhooks within a channel
	 * @param channelId Id of the channel
	 * @returns Array of [Webhook Objects](https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-structure)
	 *
	 * | Permissions needed | Condition |
	 * |--------------------|-----------|
	 * | MANAGE_WEBHOOKS    | always    |
	 *
	 * @example
	 * // Get all webhooks within a channel
	 * const client = new SnowTransfer("TOKEN")
	 * const webhooks = await client.webhook.getChannelWebhooks("channel Id")
	 */
	public async getChannelWebhooks(channelId: string): Promise<RESTGetAPIChannelWebhooksResult> {
		return this.requestHandler.request(Endpoints.CHANNEL_WEBHOOKS(channelId), "get", "json");
	}

	/**
	 * Get all webhooks within a guild
	 * @param guildId Id of the guild
	 * @returns Array of [Webhook Objects](https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-structure)
	 *
	 * | Permissions needed | Condition |
	 * |--------------------|-----------|
	 * | MANAGE_WEBHOOKS    | always    |
	 *
	 * @example
	 * // Get all webhooks within a guild
	 * const client = new SnowTransfer("TOKEN")
	 * const webhooks = await client.webhook.getGuildWebhooks("guild Id")
	 */
	public async getGuildWebhooks(guildId: string): Promise<RESTGetAPIGuildWebhooksResult> {
		return this.requestHandler.request(Endpoints.GUILD_WEBHOOKS(guildId), "get", "json");
	}

	/**
	 * Get a single Webhook via Id
	 * @param webhookId Id of the webhook
	 * @param token Webhook token
	 * @returns [Webhook Object](https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-structure)
	 *
	 * | Permissions needed | Condition     |
	 * |--------------------|---------------|
	 * | MANAGE_WEBHOOKS    | without token |
	 *
	 * @example
	 * // Get a webhook via Id providing a webhook token
	 * const client = new SnowTransfer() // No token needed if webhook token is provided
	 * const webhook = await client.webhook.getWebhook("webhook Id", "webhook token")
	 */
	public async getWebhook(webhookId: string, token?: string): Promise<RESTGetAPIWebhookResult> {
		if (token) return this.requestHandler.request(Endpoints.WEBHOOK_TOKEN(webhookId, token), "get", "json");
		return this.requestHandler.request(Endpoints.WEBHOOK(webhookId), "get", "json");
	}

	/**
	 * Update a webhook
	 * @param webhookId Id of the webhook
	 * @param data Updated Webhook properties
	 * @param token Webhook token
	 * @returns Updated [Webhook Object](https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-structure)
	 *
	 * | Permissions needed | Condition     |
	 * |--------------------|---------------|
	 * | MANAGE_WEBHOOKS    | without token |
	 *
	 * @example
	 * // Rename a webhook to "Captain Hook" with a webhook token
	 * const client = new SnowTransfer(); // No token needed if webhook token is provided
	 * const webhookData = {
	 * 	name: "Captain Hook"
	 * }
	 * const webhook = await client.webhook.updateWebhook("webhook Id", webhookData, "webhook token")
	 */
	public async updateWebhook(webhookId: string, data: RESTPatchAPIWebhookWithTokenJSONBody & { reason?: string; }, token: string): Promise<RESTPatchAPIWebhookWithTokenResult>
	public async updateWebhook(webhookId: string, data: RESTPatchAPIWebhookJSONBody & { reason?: string; }): Promise<RESTPatchAPIWebhookResult>
	public async updateWebhook(webhookId: string, data: (RESTPatchAPIWebhookWithTokenJSONBody | RESTPatchAPIWebhookJSONBody) & { reason?: string; }, token?: string): Promise<RESTPatchAPIWebhookWithTokenResult | RESTPatchAPIWebhookResult> {
		if (token) return this.requestHandler.request(Endpoints.WEBHOOK_TOKEN(webhookId, token), "patch", "json", data);
		return this.requestHandler.request(Endpoints.WEBHOOK(webhookId), "patch", "json", data);
	}

	/**
	 * Delete a Webhook
	 * @param webhookId Id of the webhook
	 * @param token Webhook token
	 * @returns Resolves the Promise on successful execution
	 *
	 * | Permissions needed | Condition     |
	 * |--------------------|---------------|
	 * | MANAGE_WEBHOOKS    | without token |
	 *
	 * @example
	 * // Delete a webhook via Id providing a webhook token
	 * const client = new SnowTransfer(); // No token needed if webhook token is provided
	 * client.webhook.deleteWebhook("webhook Id", "webhook token")
	 */
	public async deleteWebhook(webhookId: string, token?: string): Promise<RESTDeleteAPIWebhookResult> {
		if (token) return this.requestHandler.request(Endpoints.WEBHOOK_TOKEN(webhookId, token), "delete", "json") as RESTDeleteAPIWebhookResult;
		return this.requestHandler.request(Endpoints.WEBHOOK(webhookId), "delete", "json") as RESTDeleteAPIWebhookResult;
	}

	/**
	 * Send a message via Webhook
	 * @param webhookId Id of the webhook
	 * @param token webhook token
	 * @param data Webhook data to send
	 * @param options Options for executing the webhook
	 * @returns Resolves the Promise on successful execution unless wait is set to true, which returns a [message]() object
	 *
	 * @example
	 * // Send a message saying "Hi from my webhook" with a previously created webhook
	 * const client = new SnowTransfer()
	 * client.webhook.executeWebhook("webhook Id", "webhook token", { content: "Hi from my webhook" })
	 */
	public async executeWebhook(webhookId: string, token: string, data: RESTPostAPIWebhookWithTokenJSONBody & { files?: Array<{ name: string; file: Buffer; }> }, options?: RESTPostAPIWebhookWithTokenQuery & { wait?: false, disableEveryone?: boolean; }): Promise<RESTPostAPIWebhookWithTokenResult>;
	public async executeWebhook(webhookId: string, token: string, data: RESTPostAPIWebhookWithTokenJSONBody & { files?: Array<{ name: string; file: Buffer; }> }, options: RESTPostAPIWebhookWithTokenQuery & { wait: true, disableEveryone?: boolean; }): Promise<RESTPostAPIWebhookWithTokenWaitResult>;
	public async executeWebhook(webhookId: string, token: string, data: RESTPostAPIWebhookWithTokenJSONBody & { files?: Array<{ name: string; file: Buffer; }> }, options: RESTPostAPIWebhookWithTokenQuery & { disableEveryone?: boolean; } | undefined = { disableEveryone: this.disableEveryone }): Promise<RESTPostAPIWebhookWithTokenResult | RESTPostAPIWebhookWithTokenWaitResult> {
		if (typeof data !== "string" && !data?.content && !data?.embeds && !data?.components && !data?.files) throw new Error("Missing content or embeds or components or files");
		if (typeof data === "string") data = { content: data };

		// Sanitize the message
		if (data.content && (options.disableEveryone ?? this.disableEveryone)) data.content = data.content.replace(mentionRegex, replaceEveryone);
		delete options.disableEveryone;
		const query = new URLSearchParams(options as Record<string, string>);

		if (data.files) return this.requestHandler.request(`${Endpoints.WEBHOOK_TOKEN(webhookId, token)}?${query.toString()}`, "post", "multipart", Constants.standardMultipartHandler(data as Parameters<typeof Constants["standardMultipartHandler"]>["0"]));
		else return this.requestHandler.request(`${Endpoints.WEBHOOK_TOKEN(webhookId, token)}?${query.toString()}`, "post", "json", data);
	}

	/**
	 * Execute a slack style Webhook
	 * @param webhookId Id of the Webhook
	 * @param token Webhook token
	 * @param data Check [Slack's documentation](https://api.slack.com/incoming-webhooks)
	 * @param options Options for executing the webhook
	 * @returns Resolves the Promise on successful execution
	 *
	 * @example
	 * const client = new SnowTransfer() // No token needed
	 * client.webhook.executeSlackWebhook("webhook Id", "webhook token", slackdata)
	 */
	public async executeWebhookSlack(webhookId: string, token: string, data: any, options?: RESTPostAPIWebhookWithTokenSlackQuery & { wait?: false }): Promise<RESTPostAPIWebhookWithTokenSlackResult>
	public async executeWebhookSlack(webhookId: string, token: string, data: any, options?: RESTPostAPIWebhookWithTokenSlackQuery & { wait: true }): Promise<RESTPostAPIWebhookWithTokenSlackWaitResult>
	public async executeWebhookSlack(webhookId: string, token: string, data: any, options: RESTPostAPIWebhookWithTokenSlackQuery = {}): Promise<RESTPostAPIWebhookWithTokenSlackResult | RESTPostAPIWebhookWithTokenSlackWaitResult> {
		const query = new URLSearchParams(options as Record<string, string>);

		return this.requestHandler.request(`${Endpoints.WEBHOOK_TOKEN_SLACK(webhookId, token)}?${query.toString()}`, "post", "json", data);
	}

	/**
	 * Executes a github style Webhook
	 * @param webhookId Id of the Webhook
	 * @param token Webhook token
	 * @param data Check [GitHub's documentation](https://docs.github.com/en/developers/webhooks-and-events/webhook-events-and-payloads#webhook-payload-object)
	 * @param options Options for executing the webhook
	 * @returns Resolves the Promise on successful execution
	 */
	public async executeWebhookGitHub(webhookId: string, token: string, data: any, options?: RESTPostAPIWebhookWithTokenGitHubQuery & { wait?: false }): Promise<RESTPostAPIWebhookWithTokenGitHubResult>
	public async executeWebhookGitHub(webhookId: string, token: string, data: any, options?: RESTPostAPIWebhookWithTokenGitHubQuery & { wait: true }): Promise<RESTPostAPIWebhookWithTokenGitHubWaitResult>
	public async executeWebhookGitHub(webhookId: string, token: string, data: any, options: RESTPostAPIWebhookWithTokenGitHubQuery = {}): Promise<RESTPostAPIWebhookWithTokenGitHubResult | RESTPostAPIWebhookWithTokenGitHubWaitResult> {
		const query = new URLSearchParams(options as Record<string, string>);
		return this.requestHandler.request(`${Endpoints.WEBHOOK_TOKEN_GITHUB(webhookId, token)}?${query.toString()}`, "post", "json", data);
	}

	/**
	 * Get a single message from a specific Webhook via Id
	 * @param webhookId Id of the Webhook
	 * @param token Webhook token
	 * @param messageId Id of the message
	 * @param threadId Id of the thread the message was sent in
	 * @returns [discord message](https://discord.com/developers/docs/resources/channel#message-object) object
	 */
	public async getWebhookMessage(webhookId: string, token: string, messageId: string, threadId?: string): Promise<RESTGetAPIWebhookWithTokenMessageResult> {
		return this.requestHandler.request(Endpoints.WEBHOOK_TOKEN_MESSAGE(webhookId, token, messageId), "get", "json", threadId ? { thread_id: threadId } : undefined);
	}

	/**
	 * Edit a message sent by a Webhook
	 * @param webhookId Id of the Webhook
	 * @param token Webhook token
	 * @param messageId Id of the message
	 * @param data Data to send
	 * @returns [discord message](https://discord.com/developers/docs/resources/channel#message-object) object
	 *
	 * @example
	 * const client = new SnowTransfer()
	 * const message = await client.webhook.editWebhookMessage("webhook Id", "webhook token", "message Id", { content: "New content" })
	 */
	public async editWebhookMessage(webhookId: string, token: string, messageId: string, data: RESTPatchAPIWebhookWithTokenMessageJSONBody & { thread_id?: string; files?: Array<{ name: string; file: Buffer; }> }): Promise<RESTPatchAPIWebhookWithTokenMessageResult> {
		let threadID: string | undefined = undefined;
		if (data.thread_id) threadID = data.thread_id;
		delete data.thread_id;
		if (data.files) return this.requestHandler.request(`${Endpoints.WEBHOOK_TOKEN_MESSAGE(webhookId, token, messageId)}${threadID ? `?thread_id=${threadID}` : ""}`, "patch", "multipart", Constants.standardMultipartHandler(data as Parameters<typeof Constants["standardMultipartHandler"]>["0"]));
		else return this.requestHandler.request(`${Endpoints.WEBHOOK_TOKEN_MESSAGE(webhookId, token, messageId)}${threadID ? `?thread_id=${threadID}` : ""}`, "patch", "json", data);
	}

	/**
	 * Delete a message sent by a Webhook
	 * @param webhookId Id of the Webhook
	 * @param token Webhook token
	 * @param messageId Id of the message
	 * @param threadId Id of the thread the message was sent in
	 * @returns Resolves the Promise on successful execution
	 */
	public async deleteWebhookMessage(webhookId: string, token: string, messageId: string, threadId?: string): Promise<RESTDeleteAPIWebhookWithTokenMessageResult> {
		return this.requestHandler.request(`${Endpoints.WEBHOOK_TOKEN_MESSAGE(webhookId, token, messageId)}${threadId ? `?thread_id=${threadId}` : ""}`, "delete", "json") as RESTDeleteAPIWebhookWithTokenMessageResult;
	}
}

export = WebhookMethods;

const isValidUserMentionRegex = /^[&!]?\d+$/;

function replaceEveryone(_match: string, target: string) {
	if (isValidUserMentionRegex.test(target)) return `@${target}`;
	else return `@\u200b${target}`;
}
