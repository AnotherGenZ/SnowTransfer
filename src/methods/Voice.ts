import Endpoints = require("../Endpoints");

import type { RESTGetAPIVoiceRegionsResult } from "discord-api-types/v10";

/**
 * Methods for interacting with some voice
 */
class VoiceMethods {
	/**
	 * Create a new Voice Method Handler
	 *
	 * Usually SnowTransfer creates a method handler for you, this is here for completion
	 *
	 * You can access the methods listed via `client.voice.method`, where `client` is an initialized SnowTransfer instance
	 * @param requestHandler request handler that calls the rest api
	 */
	public constructor(public requestHandler: InstanceType<(typeof import("../RequestHandler"))["RequestHandler"]>) {}

	/**
	 * Get currently available voice regions that can be used when creating servers
	 * @returns Array of [voice region](https://discord.com/developers/docs/resources/voice#voice-region-object) objects
	 *
	 * @example
	 * const client = new SnowTransfer("TOKEN")
	 * const regions = await client.voice.getVoiceRegions()
	 */
	public async getVoiceRegions(): Promise<RESTGetAPIVoiceRegionsResult> {
		return this.requestHandler.request(Endpoints.VOICE_REGIONS, {}, "get", "json");
	}
}

export = VoiceMethods;
