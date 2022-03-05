import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';

import { Guild, Member, User } from '../entities';
import { Author, EmbedColors, ReplyString } from '../typings';
import { Command, Economica, EconomicaSlashCommandBuilder } from '.';

export class Context {
	public client: Economica;
	public interaction: CommandInteraction<'cached'>;
	public data: EconomicaSlashCommandBuilder;
	public userEntity: User;
	public guildEntity: Guild;
	public memberEntity: Member;
	public clientuserEntity: User;
	public clientMemberEntity: Member;
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
		User.useConnection(this.client.connection);
		Member.useConnection(this.client.connection);
		Guild.useConnection(this.client.connection);
		this.userEntity = await User.findOne({ id: this.interaction.user.id })
			?? await User.create({ id: this.interaction.user.id }).save();
		this.guildEntity = await Guild.findOne({ id: this.interaction.guildId })
			?? await Guild.create({ id: this.interaction.guildId }).save();
		this.memberEntity = await Member.findOne({ user: this.userEntity, guild: this.guildEntity })
			?? await Member.create({ user: this.userEntity, guild: this.guildEntity }).save();
		this.clientuserEntity = await User.findOne({ id: this.client.user.id })
			?? await User.create({ id: this.client.user.id }).save();
		this.clientMemberEntity = await Member.findOne({ user: this.clientuserEntity, guild: this.guildEntity })
			?? await Member.create({ user: this.clientuserEntity, guild: this.guildEntity }).save();
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
