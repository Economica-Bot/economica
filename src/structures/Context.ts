/* eslint-disable max-classes-per-file */
import { ChatInputCommandInteraction, EmbedBuilder, Util } from 'discord.js';

import { Guild, Member, User } from '../entities/index.js';
import { EmbedColors, Footer, ReplyString } from '../typings/index.js';
import { Economica, EconomicaSlashCommandBuilder } from './index.js';

export class ContextEmbed extends EmbedBuilder {
	public ctx: Context;
	constructor(ctx: Context) {
		super();
		this.ctx = ctx;
	}

	public async send(ephemeral = false) {
		if (this.ctx.interaction.deferred) await this.ctx.interaction.editReply({ embeds: [this] });
		else if (this.ctx.interaction.replied) await this.ctx.interaction.followUp({ embeds: [this], ephemeral });
		else await this.ctx.interaction.reply({ embeds: [this], ephemeral });
	}
}

export class Context {
	public client: Economica;
	public interaction: ChatInputCommandInteraction<'cached'>;
	public data: EconomicaSlashCommandBuilder;
	public userEntity: User;
	public guildEntity: Guild;
	public memberEntity: Member;
	public clientUserEntity: User;
	public clientMemberEntity: Member;
	public constructor(client: Economica, interaction?: ChatInputCommandInteraction<'cached'>) {
		this.client = client;
		this.interaction = interaction;
	}

	public async init(): Promise<this> {
		const command = this.client.commands.get(this.interaction.commandName);
		if (!command) {
			const content = 'There was an error while executing this command';
			this.interaction.reply({ content, ephemeral: true });
			throw new Error(content);
		}

		this.data = command.data;
		if (!this.interaction.inCachedGuild()) return this;

		this.userEntity = await User.findOne({ where: { id: this.interaction.user.id } })
			?? await User.create({ id: this.interaction.user.id }).save();
		this.guildEntity = await Guild.findOne({ where: { id: this.interaction.guildId } })
			?? await Guild.create({ id: this.interaction.guildId }).save();
		this.memberEntity = await Member.findOne({ where: { user: { id: this.userEntity.id }, guild: { id: this.guildEntity.id } } })
			?? await Member.create({ user: this.userEntity, guild: this.guildEntity }).save();
		this.clientUserEntity = await User.findOne({ where: { id: this.client.user.id } })
			?? await User.create({ id: this.client.user.id }).save();
		this.clientMemberEntity = await Member.findOne({ where: { user: { id: this.clientUserEntity.id }, guild: { id: this.guildEntity.id } } })
			?? await Member.create({ user: this.clientUserEntity, guild: this.guildEntity }).save();
		return this;
	}

	public embedify(type: ReplyString, footer: Footer, description?: string | null): ContextEmbed {
		const embed = new ContextEmbed(this).setColor(Util.resolveColor(EmbedColors[type]));
		if (description) embed.setDescription(description);
		if (footer === 'bot') embed.setFooter({ text: this.interaction.client.user.tag, iconURL: this.interaction.client.user.displayAvatarURL() });
		else if (footer === 'user') embed.setFooter({ text: this.interaction.user.tag, iconURL: this.interaction.user.displayAvatarURL() });
		else if (footer === 'guild') embed.setFooter({ text: this.interaction.guild.name, iconURL: this.interaction.guild.iconURL() });
		else embed.setFooter(footer);
		return embed;
	}
}
