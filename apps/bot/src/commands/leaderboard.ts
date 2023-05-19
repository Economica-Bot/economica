import { datasource, Guild, Member } from '@economica/db';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder
} from 'discord.js';
import { Command } from '../structures/commands';
import { PAGINATION_LIMIT } from '../types';

export const Leaderboard = {
	identifier: /^leaderboard$/,
	type: 'chatInput',
	execute: async (ctx) => LeaderboardPage.execute(ctx)
} satisfies Command<'chatInput'>;

export const LeaderboardPage = {
	identifier: /^leaderboard_page:(?<user>(.*)):(?<page>(.*))$/,
	type: 'button',
	execute: async ({ interaction, args, guildEntity }) => {
		let page: number;
		if (interaction.isChatInputCommand())
			page = interaction.options.getInteger('page') ?? 1;
		else page = +args.groups.page;
		const members = await datasource.getRepository(Member).find({
			where: { guildId: interaction.guildId },
			skip: (page - 1) * PAGINATION_LIMIT,
			take: PAGINATION_LIMIT,
			order: { wallet: 'ASC' }
		});
		const description = members
			.map(
				(member, i) =>
					`${
						(page - 1) * PAGINATION_LIMIT + i + 1 === 1
							? ':medal:'
							: ` \`${(page - 1) * PAGINATION_LIMIT + i + 1}\` `
					} • <@${member.userId}> | ${guildEntity.currency} \`${
						member.treasury + member.wallet
					}\``
			)
			.join('\n');
		const embed = new EmbedBuilder()
			.setDescription(description.length ? description : null)
			.setAuthor({
				name: `${interaction.guild}'s Leaderboard`,
				iconURL: interaction.guild.iconURL() ?? undefined
			});
		// .setFooter({ text: `page ${i + 1} of ${pageCount}` });
		const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setCustomId(`leaderboard_page:${interaction.user.id}:${page - 1}`)
				.setLabel('Previous Page')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 1),
			new ButtonBuilder()
				.setCustomId(`leaderboard_page:${interaction.user.id}:${page + 1}`)
				.setLabel('Next Page')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(members.length < PAGINATION_LIMIT)
		);
		interaction.isChatInputCommand()
			? await interaction.reply({ embeds: [embed], components: [row] })
			: await interaction.update({ embeds: [embed], components: [row] });
	}
} satisfies Command<'button' | 'chatInput', true, 'user' | 'page'>;
