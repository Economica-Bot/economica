import { CommandInteraction, GuildMember, Message, MessageEmbed } from 'discord.js';
import { APIMessage } from 'discord.js/node_modules/discord-api-types';

import { Guild, GuildModel, Member, MemberModel } from '../models/index.js';
import { EmbedColors } from '../typings/constants.js';
import { Author, ReplyString } from '../typings/index.js';
import { EconomicaSlashCommandBuilder } from './Builders.js';
import { Command, Economica } from './index.js';

export class Context {
	public client: Economica;
	public interaction: CommandInteraction<'cached'>;
	public data: EconomicaSlashCommandBuilder;
	public guildDocument: Guild;
	public memberDocument: Member;
	public clientDocument: Member;
	public member: GuildMember;
	public constructor(client: Economica, interaction?: CommandInteraction<'cached'>) {
		this.client = client;
		this.interaction = interaction;
	}

	public async init(): Promise<this> {
		const command = this.client.commands.get(this.interaction.commandName) as Command;
		if (!command) {
			this.interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
			throw new Error('There was an error while executing this command');
		}

		this.data = command.data as EconomicaSlashCommandBuilder;
		this.guildDocument = await GuildModel.findOneAndUpdate(
			{ guildId: this.interaction.guildId },
			{ guildId: this.interaction.guildId },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		this.memberDocument = await MemberModel.findOneAndUpdate(
			{ guild: this.guildDocument, userId: this.interaction.user.id },
			{ guild: this.guildDocument, userId: this.interaction.user.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		this.clientDocument = await MemberModel.findOneAndUpdate(
			{ guild: this.guildDocument, userId: this.client.user.id },
			{ guild: this.guildDocument, userId: this.client.user.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		this.member = this.client.guilds.cache.get(this.interaction.guildId).members.cache.get(this.client.user.id);
		return this;
	}

	public embedify(type: ReplyString, author: Author, description?: string | null): MessageEmbed;
	public async embedify(type: ReplyString, author: Author, description: string | null, ephemeral: boolean): Promise<void>;
	public embedify(type: ReplyString, author: Author, description: string | null, ephemeral?: boolean): MessageEmbed | Promise<void | Message | APIMessage> {
		const embed = new MessageEmbed().setColor(EmbedColors[type]);
		if (description) embed.setDescription(description);
		if (author === 'bot') embed.setAuthor({ name: this.interaction.client.user.username, iconURL: this.interaction.client.user.displayAvatarURL() });
		else if (author === 'user') embed.setAuthor({ name: this.interaction.user.username, iconURL: this.interaction.user.displayAvatarURL() });
		else if (author === 'guild') embed.setAuthor({ name: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL() });
		else embed.setAuthor(author);

		if (typeof ephemeral !== 'undefined') {
			if (this.interaction.deferred) return this.interaction.editReply({ embeds: [embed] });
			if (this.interaction.replied) return this.interaction.followUp({ embeds: [embed], ephemeral });
			return this.interaction.reply({ embeds: [embed], ephemeral });
		} return embed;
	}
}
