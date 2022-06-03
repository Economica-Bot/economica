/* eslint-disable max-classes-per-file */
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	EmojiResolvable,
	InteractionReplyOptions,
	Message,
	MessageComponentInteraction,
	SelectMenuBuilder,
	SelectMenuInteraction,
	Util,
} from 'discord.js';
import _ from 'lodash';

import { Guild, Member, User } from '../entities/index.js';
import { EmbedColors, Footer, PAGINATION_LIMIT, ReplyString, Emojis } from '../typings/index.js';
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

	public async selectinator<T extends ValidInteraction>(interaction: T, base: ContextEmbed, data: ChooseData[]): Promise<{
		interaction: SelectMenuInteraction<'cached'>,
		res: ChooseData
	}> {
		const pageCount = Math.ceil(data.length / PAGINATION_LIMIT) || 1;
		const pages: InteractionReplyOptions[] = [];
		const numbers: Record<number, `${Emojis}`> = {
			1: '<:icon_1:974903674868498482>',
			2: '<:icon_2:974903675891879997>',
			3: '<:icon_3:974903677087281222>',
			4: '<:icon_4:974903678920196157>',
			5: '<:icon_5:974903678018404372>',
		};
		for (let i = 0; i < pageCount; i++) {
			const embed = new EmbedBuilder(base.data);
			const selectMenu = new SelectMenuBuilder().setCustomId('select');
			const dataSubset = data.slice(i * PAGINATION_LIMIT, i * PAGINATION_LIMIT + PAGINATION_LIMIT);
			embed.addFields(dataSubset.map((d, j) => ({ name: `${numbers[j + 1]} ${d.emoji || ''} ${d.name}`, value: d.description })));
			selectMenu.addOptions(dataSubset.map((d, j) => ({ emoji: { id: Util.parseEmoji(numbers[j + 1]).id }, label: `${d.clean}`, value: d.value })));
			const row = new ActionRowBuilder<SelectMenuBuilder>().setComponents([selectMenu]);
			const page: InteractionReplyOptions = { embeds: [embed], components: selectMenu.options.length ? [row] : [] };
			pages.push(page);
		}

		const selectMenuInteraction = await this.paginator<T>({ pages, interaction });
		const res = data.find((d) => d.value === selectMenuInteraction.values['0']);
		return { interaction: selectMenuInteraction, res };
	}

	public async paginator<T extends ValidInteraction>({ pages, interaction, index = 0 }: {
		pages: InteractionReplyOptions[],
		interaction: T,
		index?: number
	}) {
		const component = new ActionRowBuilder<ButtonBuilder>()
			.setComponents([
				new ButtonBuilder()
					.setCustomId('previous')
					.setEmoji({ id: Util.parseEmoji(Emojis.PREVIOUS).id })
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(index === 0),
				new ButtonBuilder()
					.setCustomId('next')
					.setEmoji({ id: Util.parseEmoji(Emojis.NEXT).id })
					.setStyle(ButtonStyle.Primary)
					.setDisabled(index + 1 === pages.length),
			]);

		const reply = _.cloneDeep(pages[index]);
		if (reply.components) reply.components.push(component);
		else Object.assign(reply, { components: [component] });
		let message: Message<true>;
		if (interaction.isChatInputCommand()) message = await interaction.reply({ ...reply, fetchReply: true });
		else message = await interaction.update({ ...reply, fetchReply: true } as any);
		const res = await message.awaitMessageComponent();
		if (res.isSelectMenu()) return res as any;
		return this.paginator({ pages, interaction: res, index: res.customId === 'next' ? index + 1 : index - 1 });
	}
}

type ValidInteraction = ChatInputCommandInteraction<'cached'> | SelectMenuInteraction<'cached'> | ButtonInteraction<'cached'> | MessageComponentInteraction<'cached'>;

export type ChooseData = {
	name: string,
	clean: string,
	description: string,
	value: string,
	emoji?: EmojiResolvable
};
