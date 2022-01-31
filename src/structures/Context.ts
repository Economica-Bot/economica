import { ColorResolvable, CommandInteraction, Message, MessageEmbed } from 'discord.js';
import { Document } from 'mongoose';

import { EconomicaClient, EconomicaSlashCommandBuilder } from '.';
import { Guild } from '../models/guilds';
import { Member } from '../models/members';
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
	public data: EconomicaSlashCommandBuilder;
	public guildDocument: Guild & Document<Guild>;
	public memberDocument: Member & Document<Member>;

	public constructor(
		client: EconomicaClient,
		interaction: CommandInteraction,
		data: EconomicaSlashCommandBuilder,
		guildDocument: Guild & Document<Guild>,
		memberDocument: Member & Document<Member>
	) {
		this.client = client;
		this.interaction = interaction;
		this.data = data;
		this.guildDocument = guildDocument;
		this.memberDocument = memberDocument;
	}

	public embedify(type: ReplyString, author: Author, description?: string | null): MessageEmbed;
	public embedify(type: ReplyString, author: Author, description: string | null, ephemeral: boolean): Promise<Message>;
	public embedify(
		type: ReplyString,
		author: Author,
		description: string | null,
		ephemeral?: boolean
	): MessageEmbed | Promise<any> {
		const embed = new MessageEmbed().setColor(EmbedColors[type]);

		if (description) {
			embed.setDescription(description);
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

		if (typeof ephemeral !== 'undefined') {
			if (this.interaction.deferred) {
				return this.interaction.editReply({ embeds: [embed] });
			} else if (this.interaction.replied) {
				return this.interaction.followUp({ embeds: [embed], ephemeral });
			} else {
				return this.interaction.reply({ embeds: [embed], ephemeral });
			}
		} else return embed;
	}
}
