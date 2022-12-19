import { inviteOptions } from '@economica/common';
import { EmbedBuilder } from 'discord.js';
import { Command } from '../structures/commands';

export const Invite = {
	identifier: /^invite$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const invite = interaction.client.generateInvite(inviteOptions);
		const embed = new EmbedBuilder()
			.setAuthor({ name: interaction.client.user.username })
			.setDescription(
				`**Invite ${interaction.client.user} to your server!**\n[Click Me!](${invite} 'Invite Economica')`
			);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
