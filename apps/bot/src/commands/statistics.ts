import { Emojis } from '@economica/common';
import { Command as DiscordCommand, datasource } from '@economica/db';
import { EmbedBuilder, parseEmoji } from 'discord.js';
import ms from 'ms';
import { Command } from '../structures/commands';

export const Statistics = {
	identifier: /^statistics$/,
	type: 'chatInput',
	execute: async ({ interaction }) => {
		const description = `**Welcome to ${interaction.client.user}'s Statistics Dashboard!**`;
		const botStats =
			`Websocket Ping: \`${interaction.client.ws.ping}ms\`\n` +
			`Bot Uptime: \`${ms(interaction.client.uptime)}\`\n` +
			`Commands Ran: \`${await datasource
				.getRepository(DiscordCommand)
				.countBy({ member: { guildId: interaction.guildId } })}\``;
		const memberStats =
			`Roles: \`${interaction.member.roles.cache.size}\`\n` +
			`Commands Used: \`${await datasource
				.getRepository(DiscordCommand)
				.countBy({
					member: { guildId: interaction.guildId, userId: interaction.user.id }
				})}\`\n` +
			!!interaction.member.joinedAt
				? `Est. ${
						interaction.member.joinedAt
							? `<t:${Math.round(
									interaction.member.joinedAt.getTime() / 1000
							  )}:f>`
							: 'n/a'
				  }`
				: '';
		const serverStats =
			`Roles: \`${interaction.guild.roles.cache.size}\`\n` +
			`Members: \`${interaction.guild.members.cache.size}\`\n` +
			`Channels: \`${interaction.guild.channels.cache.size}\``;
		const embed = new EmbedBuilder()
			.setDescription(description)
			.setAuthor({
				name: 'Statistics Dashboard',
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				iconURL: interaction.client.emojis.resolve(
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					parseEmoji(Emojis.TREND)!.id!
				)!.url
			})
			.addFields([
				{
					name: `${Emojis.CPU} \`Bot Statistics\``,
					value: botStats,
					inline: true
				},
				{
					name: `${Emojis.PERSON_ADD} \`Member Statistics\``,
					value: memberStats,
					inline: true
				},
				{
					name: `${Emojis.NETWORK} \`Server Statistics\``,
					value: serverStats,
					inline: true
				}
			]);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
