import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder
} from 'discord.js';
import { trpc } from '../lib/trpc';
import { Command } from '../structures/commands';

export const Leaderboard = {
	identifier: /^leaderboard$/,
	type: 'chatInput',
	execute: async (interaction) =>
		LeaderboardPage.execute(interaction, undefined as any)
} satisfies Command<'chatInput'>;

export const LeaderboardPage = {
	identifier: /^leaderboard_page:(?<user>(.*)):(?<page>(.*))$/,
	type: 'button',
	execute: async (interaction, args) => {
		let page: number;
		if (interaction.isChatInputCommand())
			page = interaction.options.getInteger('page') ?? 1;
		else page = +args.groups.page;

		const limit = 5;

		const guildEntity = await trpc.guild.byId.query({
			id: interaction.guildId
		});
		const members = await trpc.member.list.query({
			guildId: interaction.guildId,
			page,
			limit
		});
		const description = members
			.map(
				(member, i) =>
					`${
						(page - 1) * limit + i + 1 === 1
							? ':medal:'
							: ` \`${(page - 1) * limit + i + 1}\` `
					} • <@${member.userId}> | ${guildEntity.currency} \`${
						member.treasury + member.wallet
					}\``
			)
			.join('\n');
		const embed = new EmbedBuilder().setDescription(description).setAuthor({
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
				.setDisabled(members.length < limit)
		);
		interaction.isChatInputCommand()
			? await interaction.reply({ embeds: [embed], components: [row] })
			: await interaction.update({ embeds: [embed], components: [row] });
	}
} satisfies Command<'button' | 'chatInput', 'user' | 'page'>;
