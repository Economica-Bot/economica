import { ColorResolvable, CommandInteraction, MessageEmbed } from 'discord.js';
import { Document } from 'mongoose';

import { EconomicaClient } from '.';
import { Guild } from '../models/guilds';
import { Author, ReplyString } from '../typings';

const EmbedColors: Record<ReplyString, ColorResolvable> = {
	success: 'GREEN',
	error: 'RED',
	info: 'BLURPLE',
	warn: 'YELLOW',
};

export class Context {
	public client: EconomicaClient;
	public interaction: CommandInteraction;
	public guildDocument: Guild & Document<Guild>;

	public constructor(client: EconomicaClient, interaction: CommandInteraction, guildDocument: Guild & Document<Guild>) {
		this.client = client;
		this.interaction = interaction;
		this.guildDocument = guildDocument;
	}

	public embedify(
		type: ReplyString,
		author: Author,
		content: string | null,
		send: boolean = true
	): MessageEmbed | Promise<any> {
		const embed = new MessageEmbed().setColor(EmbedColors[type]);

		if (content) {
			embed.setDescription(content);
		}

		if (author === 'bot') {
			embed.setAuthor({
				name: this.interaction.client.user.username,
				iconURL: this.interaction.client.user.displayAvatarURL(),
			});
		} else if (author === 'user') {
			embed.setAuthor({
				name: this.interaction.user.username,
				iconURL: this.interaction.user.displayAvatarURL(),
			});
		} else if (author === 'guild') {
			embed.setAuthor({
				name: this.interaction.guild.name,
				iconURL: this.interaction.guild.iconURL(),
			});
		} else {
			embed.setAuthor(author);
		}

		if (send) {
			if (this.interaction.deferred) {
				return this.interaction.editReply({ embeds: [embed] });
			} else if (this.interaction.replied) {
				return this.interaction.followUp({ embeds: [embed] });
			} else {
				return this.interaction.reply({ embeds: [embed] });
			}
		} else return embed;
	}
}
