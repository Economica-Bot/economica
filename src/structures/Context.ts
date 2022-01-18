import { CommandInteraction } from 'discord.js';
import { Document } from 'mongoose';
import { EconomicaClient } from '.';
import { Guild } from '../models/guilds';

export class Context {
	public client: EconomicaClient;
	public interaction: CommandInteraction;
	public guildDocument: Document<Guild>;

	public constructor(
		client: EconomicaClient,
		interaction: CommandInteraction,
		guildDocument: Document<Guild>
	) {
		this.client = client;
		this.interaction = interaction;
		this.guildDocument = guildDocument;
	}
}
