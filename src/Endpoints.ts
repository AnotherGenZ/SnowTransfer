"use strict";

import Constants from "./Constants";

/**
 * Mostly taken from https://github.com/abalabahaha/eris/blob/master/lib/rest/Endpoints.js
 *
 * Removed User-only endpoints
 */
const Endpoints = {
	BASE_URL: "/api/v" + Constants.REST_API_VERSION as `/api/v${typeof Constants.REST_API_VERSION}`,
	BASE_HOST: "https://discord.com" as const,
	CDN_URL: "https://cdn.discordapp.com" as const,

	APPLICATION_COMMAND: (appID: string, cmdID: string) => `${Endpoints.APPLICATION_COMMANDS(appID)}/${cmdID}` as `${ReturnType<typeof Endpoints.APPLICATION_COMMANDS>}/{cmd_id}`,
	APPLICATION_COMMANDS: (appID: string) => `/applications/${appID}/commands` as "/applications/{app_id}/commands",
	APPLICATION_GUILD_COMMANDS_PERMISSIONS: (appID: string, guildID: string) => `${Endpoints.APPLICATION_GUILD_COMMANDS(appID, guildID)}/permissions` as `${ReturnType<typeof Endpoints.APPLICATION_GUILD_COMMANDS>}/permissions`,
	APPLICATION_GUILD_COMMAND_PERMISSIONS: (appID: string, guildID: string, cmdID: string) => `${Endpoints.APPLICATION_GUILD_COMMAND(appID, guildID, cmdID)}/permissions` as `${ReturnType<typeof Endpoints.APPLICATION_GUILD_COMMAND>}/permissions`,
	APPLICATION_GUILD_COMMAND: (appID: string, guildID: string, cmdID: string) => `${Endpoints.APPLICATION_GUILD_COMMANDS(appID, guildID)}/${cmdID}` as `${ReturnType<typeof Endpoints.APPLICATION_GUILD_COMMANDS>}/{cmd_id}`,
	APPLICATION_GUILD_COMMANDS: (appID: string, guildID: string) => `/applications/${appID}/guilds/${guildID}/commands` as "/applications/{app_id}/guilds/{guild_id}/commands",
	CHANNEL: (chanID: string) => `${Endpoints.CHANNELS}/${chanID}` as `${typeof Endpoints.CHANNELS}/{channel_id}`,
	CHANNEL_BULK_DELETE: (chanID: string) => `${Endpoints.CHANNEL_MESSAGES(chanID)}/bulk-delete` as `${ReturnType<typeof Endpoints.CHANNEL_MESSAGES>}/bulk-delete`,
	CHANNEL_FOLLOWERS: (chanID: string) => `${Endpoints.CHANNEL(chanID)}/followers` as `${ReturnType<typeof Endpoints.CHANNEL>}/followers`,
	CHANNEL_INVITES: (chanID: string) => `${Endpoints.CHANNEL(chanID)}/invites` as `${ReturnType<typeof Endpoints.CHANNEL>}/invites`,
	CHANNEL_MESSAGE: (chanID: string, msgID: string) => `${Endpoints.CHANNEL_MESSAGES(chanID)}/${msgID}` as `${ReturnType<typeof Endpoints.CHANNEL_MESSAGES>}/{message_id}`,
	CHANNEL_MESSAGE_CROSSPOST: (chanID: string, msgID: string) => `${Endpoints.CHANNEL_MESSAGE(chanID, msgID)}/crosspost` as `${ReturnType<typeof Endpoints.CHANNEL_MESSAGE>}/crosspost`,
	CHANNEL_MESSAGE_REACTION: (chanID: string, msgID: string, reaction: string) => `${Endpoints.CHANNEL_MESSAGE_REACTIONS(chanID, msgID)}/${reaction}` as `${ReturnType<typeof Endpoints.CHANNEL_MESSAGE_REACTIONS>}/{reaction}`,
	CHANNEL_MESSAGE_REACTION_USER: (chanID: string, msgID: string, reaction: string, userID: string) => `${Endpoints.CHANNEL_MESSAGE_REACTION(chanID, msgID, reaction)}/${userID}` as `${ReturnType<typeof Endpoints.CHANNEL_MESSAGE_REACTION>}/{user_id}`,
	CHANNEL_MESSAGE_REACTIONS: (chanID: string, msgID: string) => `${Endpoints.CHANNEL_MESSAGE(chanID, msgID)}/reactions` as `${ReturnType<typeof Endpoints.CHANNEL_MESSAGE>}/reactions`,
	CHANNEL_MESSAGE_THREADS: (chanID: string, msgID: string) => `${Endpoints.CHANNEL_MESSAGE(chanID, msgID)}/threads` as `${ReturnType<typeof Endpoints.CHANNEL_MESSAGE>}/threads`,
	CHANNEL_MESSAGES: (chanID: string) => `${Endpoints.CHANNEL(chanID)}/messages` as `${ReturnType<typeof Endpoints.CHANNEL>}/messages`,
	CHANNEL_PERMISSION: (chanID: string, permID: string) => `${Endpoints.CHANNEL_PERMISSIONS(chanID)}/${permID}` as `${ReturnType<typeof Endpoints.CHANNEL_PERMISSIONS>}/{perm_id}`,
	CHANNEL_PERMISSIONS: (chanID: string) => `${Endpoints.CHANNEL(chanID)}/permissions` as `${ReturnType<typeof Endpoints.CHANNEL>}/permissions`,
	CHANNEL_PIN: (chanID: string, msgID: string) => `${Endpoints.CHANNEL_PINS(chanID)}/${msgID}` as `${ReturnType<typeof Endpoints.CHANNEL_PINS>}/{message_id}`,
	CHANNEL_PINS: (chanID: string) => `${Endpoints.CHANNEL(chanID)}/pins` as `${ReturnType<typeof Endpoints.CHANNEL>}/pins`,
	CHANNEL_RECIPIENT: (chanID: string, userID: string) => `${Endpoints.CHANNEL(chanID)}/recipients/${userID}` as `${ReturnType<typeof Endpoints.CHANNEL>}/recipients/{user_id}`,
	CHANNEL_THREADS: (chanID: string) => `${Endpoints.CHANNEL(chanID)}/threads` as `${ReturnType<typeof Endpoints.CHANNEL>}/threads`,
	CHANNEL_THREAD_MEMBER: (chanID: string, memberID: string) => `${Endpoints.CHANNEL_THREAD_MEMBERS(chanID)}/${memberID}` as `${ReturnType<typeof Endpoints.CHANNEL_THREAD_MEMBERS>}/{member_id}`,
	CHANNEL_THREAD_MEMBERS: (chanID: string) => `${Endpoints.CHANNEL(chanID)}/thread-members` as `${ReturnType<typeof Endpoints.CHANNEL>}/thread-members`,
	CHANNEL_THREADS_ARCHIVED_PRIVATE: (chanID: string) => `${Endpoints.CHANNEL_THREADS(chanID)}/archived/private` as `${ReturnType<typeof Endpoints.CHANNEL_THREADS>}/archived/private`,
	CHANNEL_THREADS_ARCHIVED_PRIVATE_USER: (chanID: string) => `${Endpoints.CHANNEL(chanID)}/users/@me/threads/archived/private` as `${ReturnType<typeof Endpoints.CHANNEL>}/users/@me/threads/archived/private`,
	CHANNEL_THREADS_ARCHIVED_PUBLIC: (chanID: string) => `${Endpoints.CHANNEL_THREADS(chanID)}/archived/public` as `${ReturnType<typeof Endpoints.CHANNEL_THREADS>}/archived/public`,
	CHANNEL_TYPING: (chanID: string) => `${Endpoints.CHANNEL(chanID)}/typing` as `${ReturnType<typeof Endpoints.CHANNEL>}/typing`,
	CHANNEL_WEBHOOKS: (chanID: string) => `${Endpoints.CHANNEL(chanID)}/webhooks` as `${ReturnType<typeof Endpoints.CHANNEL>}/webhooks`,
	CHANNELS: "/channels" as const,
	GATEWAY: "/gateway" as const,
	GATEWAY_BOT: "/gateway/bot" as const,
	GUILD: (guildID: string) => `${Endpoints.GUILDS}/${guildID}` as `${typeof Endpoints.GUILDS}/{guild_id}`,
	GUILD_AUDIT_LOGS: (guildID: string) => `${Endpoints.GUILD(guildID)}/audit-logs` as `${ReturnType<typeof Endpoints.GUILD>}/audit-logs`,
	GUILD_BAN: (guildID: string, memberID: string) => `${Endpoints.GUILD_BANS(guildID)}/${memberID}` as `${ReturnType<typeof Endpoints.GUILD_BANS>}/{member_id}`,
	GUILD_BANS: (guildID: string) => `${Endpoints.GUILD(guildID)}/bans` as `${ReturnType<typeof Endpoints.GUILD>}/bans`,
	GUILD_CHANNELS: (guildID: string) => `${Endpoints.GUILD(guildID)}/channels` as `${ReturnType<typeof Endpoints.GUILD>}/channels`,
	GUILD_EMOJI: (guildID: string, emojiID: string) => `${Endpoints.GUILD_EMOJIS(guildID)}/${emojiID}` as `${ReturnType<typeof Endpoints.GUILD_EMOJIS>}/{emoji_id}`,
	GUILD_EMOJIS: (guildID: string) => `${Endpoints.GUILD(guildID)}/emojis` as `${ReturnType<typeof Endpoints.GUILD>}/emojis`,
	GUILD_INVITES: (guildID: string) => `${Endpoints.GUILD(guildID)}/invites` as `${ReturnType<typeof Endpoints.GUILD>}/invites`,
	GUILD_INTEGRATION: (guildID: string, integrationID: string) => `${Endpoints.GUILD_INTEGRATIONS(guildID)}/${integrationID}` as `${ReturnType<typeof Endpoints.GUILD_INTEGRATIONS>}/{integration_id}`,
	GUILD_INTEGRATIONS: (guildID: string) => `${Endpoints.GUILD(guildID)}/integrations` as `${ReturnType<typeof Endpoints.GUILD>}/integrations`,
	GUILD_MEMBER: (guildID: string, memberID: string) => `${Endpoints.GUILD_MEMBERS(guildID)}/${memberID}` as `${ReturnType<typeof Endpoints.GUILD_MEMBERS>}/{member_id}`,
	GUILD_MEMBER_ROLE: (guildID: string, memberID: string, roleID: string) => `${Endpoints.GUILD_MEMBER(guildID, memberID)}/roles/${roleID}` as `${ReturnType<typeof Endpoints.GUILD_MEMBER>}/roles/{role_id}`,
	GUILD_MEMBERS: (guildID: string) => `${Endpoints.GUILD(guildID)}/members` as `${ReturnType<typeof Endpoints.GUILD>}/members`,
	GUILD_MEMBERS_SEARCH: (guildID: string) => `${Endpoints.GUILD_MEMBERS(guildID)}/search` as `${ReturnType<typeof Endpoints.GUILD_MEMBERS>}/search`,
	GUILD_PREVIEW: (guildID: string) => `${Endpoints.GUILD(guildID)}/preview` as `${ReturnType<typeof Endpoints.GUILD>}/preview`,
	GUILD_PRUNE: (guildID: string) => `${Endpoints.GUILD(guildID)}/prune` as `${ReturnType<typeof Endpoints.GUILD>}/prune`,
	GUILD_ROLE: (guildID: string, roleID: string) => `${Endpoints.GUILD_ROLES(guildID)}/${roleID}` as `${ReturnType<typeof Endpoints.GUILD_ROLES>}/{role_id}`,
	GUILD_ROLES: (guildID: string) => `${Endpoints.GUILD(guildID)}/roles` as `${ReturnType<typeof Endpoints.GUILD>}/roles`,
	GUILD_SCHEDULED_EVENTS: (guildID: string) => `${Endpoints.GUILD(guildID)}/scheduled-events` as `${ReturnType<typeof Endpoints.GUILD>}/scheduled-events`,
	GUILD_SCHEDULED_EVENT: (guildID: string, eventId: string) => `${Endpoints.GUILD_SCHEDULED_EVENTS(guildID)}/${eventId}` as `${ReturnType<typeof Endpoints.GUILD_SCHEDULED_EVENTS>}/{event_id}`,
	GUILD_SCHEDULED_EVENT_USERS: (guildID: string, eventId: string) => `${Endpoints.GUILD_SCHEDULED_EVENT(guildID, eventId)}/users` as `${ReturnType<typeof Endpoints.GUILD_SCHEDULED_EVENT>}/users`,
	GUILD_STICKER: (guildID: string, stickerID: string) => `${Endpoints.GUILD_STICKERS(guildID)}/${stickerID}` as `${ReturnType<typeof Endpoints.GUILD_STICKERS>}/{sticker_id}`,
	GUILD_STICKERS: (guildID: string) => `${Endpoints.GUILD(guildID)}/stickers` as `${ReturnType<typeof Endpoints.GUILD>}/stickers`,
	GUILD_TEMPLATE: (guildID: string, code: string) => `${Endpoints.GUILD_TEMPLATES(guildID)}/${code}` as `${ReturnType<typeof Endpoints.GUILD_TEMPLATES>}/{code}`,
	GUILD_THREADS_ACTIVE: (guildID: string) => `${Endpoints.GUILD(guildID)}/threads/active` as `${ReturnType<typeof Endpoints.GUILD>}/threads/active`,
	GUILD_TEMPLATES: (guildID: string) => `${Endpoints.GUILD(guildID)}/templates` as `${ReturnType<typeof Endpoints.GUILD>}/templates`,
	GUILD_VANITY: (guildID: string) => `${Endpoints.GUILD(guildID)}/vanity-url` as `${ReturnType<typeof Endpoints.GUILD>}/vanity-url`,
	GUILD_VOICE_REGIONS: (guildID: string) => `${Endpoints.GUILD(guildID)}/regions` as `${ReturnType<typeof Endpoints.GUILD>}/regions`,
	GUILD_VOICE_STATE_USER: (guildID: string, memberID: string) => `${Endpoints.GUILD(guildID)}/voice-states/${memberID}` as `${ReturnType<typeof Endpoints.GUILD>}/voice-states/{member-id}`,
	GUILD_WEBHOOKS: (guildID: string) => `${Endpoints.GUILD(guildID)}/webhooks` as `${ReturnType<typeof Endpoints.GUILD>}/webhooks`,
	GUILD_WELCOME_SCREEN: (guildID: string) => `${Endpoints.GUILD(guildID)}/welcome-screen` as `${ReturnType<typeof Endpoints.GUILD>}/welcome-screen`,
	GUILD_WIDGET: (guildID: string) => `${Endpoints.GUILD(guildID)}/widget.json` as `${ReturnType<typeof Endpoints.GUILD>}/widget.json`,
	GUILD_WIDGET_SETTINGS: (guildID: string) => `${Endpoints.GUILD(guildID)}/widget` as `${ReturnType<typeof Endpoints.GUILD>}/widget`,
	GUILDS: "/guilds" as const,
	INTERACTION_CALLBACK: (interactionID: string, token: string) => `/interactions/${interactionID}/${token}/callback` as "/interactions/{interaction_id}/{token}/callback",
	INVITES: (inviteID: string) => `/invites/${inviteID}` as "/invites/{invite_id}",
	OAUTH2_APPLICATION: (appID: string) => `/oauth2/applications/${appID}` as "/oauth2/applications/{app_id}",
	STAGE_INSTANCE_CHANNEL: (chanID: string) => `${Endpoints.STAGE_INSTANCES}/${chanID}` as `${typeof Endpoints.STAGE_INSTANCES}/{channel_id}`,
	STAGE_INSTANCES: "/stage-instances" as const,
	STICKER: (stickerID: string) => `/stickers/${stickerID}` as "/stickers/{sticker_id}",
	TEMPLATE: (code: string) => `/guilds/templates/${code}` as "/guilds/templates/{code}",
	USER: (userID: string) => `${Endpoints.USERS}/${userID}` as `${typeof Endpoints.USERS}/{user_id}`,
	USER_CHANNELS: (userID: string) => `${Endpoints.USER(userID)}/channels` as `${ReturnType<typeof Endpoints.USER>}/channels`,
	USER_GUILD: (userID: string, guildID: string) => `${Endpoints.USER_GUILDS(userID)}/${guildID}` as `${ReturnType<typeof Endpoints.USER_GUILDS>}/{guild_id}`,
	USER_GUILDS: (userID: string) => `${Endpoints.USER(userID)}/guilds` as `${ReturnType<typeof Endpoints.USER>}/guilds`,
	USERS: "/users" as const,
	VOICE_REGIONS: "/voice/regions" as const,
	WEBHOOK: (hookID: string) => `/webhooks/${hookID}` as "/webhooks/{hook_id}",
	WEBHOOK_TOKEN: (hookID: string, token: string) => `${Endpoints.WEBHOOK(hookID)}/${token}` as `${ReturnType<typeof Endpoints.WEBHOOK>}/{token}`,
	WEBHOOK_TOKEN_GITHUB: (hookID: string, token: string) => `${Endpoints.WEBHOOK_TOKEN(hookID, token)}/github` as `${ReturnType<typeof Endpoints.WEBHOOK_TOKEN>}/github`,
	WEBHOOK_TOKEN_MESSAGE: (hookID: string, token: string, msgID: string) => `/webhooks/${hookID}/${token}/messages/${msgID}` as `${ReturnType<typeof Endpoints.WEBHOOK_TOKEN>}/messages/{message_id}`,
	WEBHOOK_TOKEN_SLACK: (hookID: string, token: string) => `${Endpoints.WEBHOOK_TOKEN(hookID, token)}/slack` as `${ReturnType<typeof Endpoints.WEBHOOK_TOKEN>}/slack`,
};

export = Endpoints;
