import { datasource, Guild, Member } from '@economica/db';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder
} from 'discord.js';
import { Command } from '../structures/commands';

export const Leaderboard = {
	identifier: /^leaderboard$/,
	type: 'chatInput',
	execute: async (interaction) =>
		LeaderboardPage.execute(interaction, undefined as never)
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

		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		const members = await datasource.getRepository(Member).find({
			where: {
				guildId: interaction.guildId
			},
			skip: (page - 1) * limit,
			take: limit,
			order: {
				wallet: 'ASC'
			}
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
