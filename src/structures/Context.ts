import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';

import { EmbedColors } from '../typings/constants.js';
import { Author, ReplyString } from '../typings/index.js';
import { EconomicaSlashCommandBuilder } from './Builders.js';
import { Command, Economica } from './index.js';

export class Context {
	public client: Economica;
	public interaction: CommandInteraction<'cached'>;
	public data: EconomicaSlashCommandBuilder;
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
		this.member = this.client.guilds.cache.get(this.interaction.guildId).members.cache.get(this.client.user.id);
		return this;
	}

	public embedify(type: ReplyString, author: Author, description?: string | null): MessageEmbed;
	public async embedify(type: ReplyString, author: Author, description: string | null, ephemeral: boolean): Promise<void>;
	public embedify(type: ReplyString, author: Author, description: string | null, ephemeral?: boolean): MessageEmbed | Promise<void> {
		const embed = new MessageEmbed().setColor(EmbedColors[type]);
		if (description) embed.setDescription(description);
		if (author === 'bot') embed.setAuthor({ name: this.interaction.client.user.username, iconURL: this.interaction.client.user.displayAvatarURL() });
		else if (author === 'user') embed.setAuthor({ name: this.interaction.user.username, iconURL: this.interaction.user.displayAvatarURL() });
		else if (author === 'guild') embed.setAuthor({ name: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL() });
		else embed.setAuthor(author);

		if (typeof ephemeral !== 'undefined') {
			if (this.interaction.deferred) this.interaction.editReply({ embeds: [embed] });
			if (this.interaction.replied) this.interaction.followUp({ embeds: [embed], ephemeral });
			this.interaction.reply({ embeds: [embed], ephemeral });
		} return embed;
	}
}
