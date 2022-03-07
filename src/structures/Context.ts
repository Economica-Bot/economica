import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';

import { Guild, Member, User } from '../entities';
import { EmbedColors, Footer, ReplyString } from '../typings/index.js';
import { Economica, EconomicaSlashCommandBuilder } from './index.js';

export class Context {
	public client: Economica;
	public interaction: CommandInteraction<'cached'>;
	public data: EconomicaSlashCommandBuilder;
	public userEntity: User;
	public guildEntity: Guild;
	public memberEntity: Member;
	public clientUserEntity: User;
	public clientMemberEntity: Member;
	public member: GuildMember;
	public constructor(client: Economica, interaction?: CommandInteraction<'cached'>) {
		this.client = client;
		this.interaction = interaction;
	}

	public async init(): Promise<this> {
		const command = this.client.commands.get(this.interaction.commandName);
		if (!command) {
			this.interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
			throw new Error('There was an error while executing this command');
		}

		this.data = command.data;
		this.userEntity = await User.findOne({ id: this.interaction.user.id })
			?? await User.create({ id: this.interaction.user.id }).save();
		this.guildEntity = await Guild.findOne({ id: this.interaction.guildId })
			?? await Guild.create({ id: this.interaction.guildId }).save();
		this.memberEntity = await Member.findOne({ user: this.userEntity, guild: this.guildEntity })
			?? await Member.create({ user: this.userEntity, guild: this.guildEntity }).save();
		this.clientUserEntity = await User.findOne({ id: this.client.user.id })
			?? await User.create({ id: this.client.user.id }).save();
		this.clientMemberEntity = await Member.findOne({ user: this.clientUserEntity, guild: this.guildEntity })
			?? await Member.create({ user: this.clientUserEntity, guild: this.guildEntity }).save();
		this.member = this.client.guilds.cache.get(this.interaction.guildId).members.cache.get(this.client.user.id);
		return this;
	}

	public embedify(type: ReplyString, footer: Footer, description?: string | null): MessageEmbed;
	public async embedify(type: ReplyString, footer: Footer, description: string | null, ephemeral: boolean): Promise<void>;
	public embedify(type: ReplyString, footer: Footer, description: string | null, ephemeral?: boolean): MessageEmbed | Promise<void> {
		const embed = new MessageEmbed().setColor(EmbedColors[type]);
		if (description) embed.setDescription(description);
		if (footer === 'bot') embed.setFooter({ text: this.interaction.client.user.username, iconURL: this.interaction.client.user.displayAvatarURL() });
		else if (footer === 'user') embed.setFooter({ text: this.interaction.user.username, iconURL: this.interaction.user.displayAvatarURL() });
		else if (footer === 'guild') embed.setFooter({ text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL() });
		else embed.setFooter(footer);

		if (typeof ephemeral !== 'undefined') {
			if (this.interaction.deferred) this.interaction.editReply({ embeds: [embed] });
			if (this.interaction.replied) this.interaction.followUp({ embeds: [embed], ephemeral });
			this.interaction.reply({ embeds: [embed], ephemeral });
		} return embed;
	}
}
