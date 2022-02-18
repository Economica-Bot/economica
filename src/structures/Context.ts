import { CommandInteraction, GuildMember, Message, MessageEmbed } from 'discord.js';
import { Document } from 'mongoose';

import { EconomicaClient, EconomicaCommand, EconomicaSlashCommandBuilder } from '.';
import { EmbedColors } from '../config';
import { GuildModel, MemberModel } from '../models';
import { Guild } from '../models/guilds';
import { Member } from '../models/members';
import { Author, ReplyString } from '../typings';

export class Context {
	public client: EconomicaClient;
	public interaction: CommandInteraction;
	public data: EconomicaSlashCommandBuilder;
	public guildDocument: Guild;
	public memberDocument: Member;
	public clientDocument: Member;
	public member: GuildMember;

	public constructor(client: EconomicaClient, interaction?: CommandInteraction) {
		this.client = client;
		this.interaction = interaction;
	}

	public async init(): Promise<this> {
		const command = this.client.commands.get(this.interaction.commandName) as EconomicaCommand;
		if (!command) {
			this.interaction.reply({
				content: 'There was an error while executing this command.',
				ephemeral: true,
			});
			throw new Error(`There was an error while executing this command`);
		}

		this.data = command.data as EconomicaSlashCommandBuilder;
		this.guildDocument = await GuildModel.findOneAndUpdate(
			{
				guildId: this.interaction.guildId,
			},
			{
				guildId: this.interaction.guildId,
			},
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true,
			}
		);
		this.memberDocument = await MemberModel.findOneAndUpdate(
			{
				guild: this.guildDocument,
				userId: this.interaction.user.id,
			},
			{
				guild: this.guildDocument,
				userId: this.interaction.user.id,
			},
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true,
			}
		);
		this.clientDocument = await MemberModel.findOneAndUpdate(
			{
				guild: this.guildDocument,
				userId: this.client.user.id,
			},
			{
				guild: this.guildDocument,
				userId: this.client.user.id,
			},
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true,
			}
		);
		this.member = this.client.guilds.cache.get(this.interaction.guildId).members.cache.get(this.client.user.id);
		return this;
	}

	public embedify(type: ReplyString, author: Author, description?: string | null): MessageEmbed;
	public embedify(type: ReplyString, author: Author, description: string | null, ephemeral: boolean): Promise<void>;
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
