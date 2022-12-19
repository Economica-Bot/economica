import { Emojis } from '@economica/common';
import { EmbedBuilder } from 'discord.js';

import { validateTarget } from '../lib/moderation';
import { trpc } from '../lib/trpc';
import { Command } from '../structures/commands';

export const Untimeout = {
	identifier: /^untimeout$/,
	type: 'chatInput',
	execute: async (interaction) => {
		await validateTarget(interaction);
		const target = interaction.options.getUser('target', true);
		const targetMember = await interaction.guild.members.fetch({
			user: target
		});
		const reason =
			interaction.options.getString('reason') ?? 'No reason provided';
		await targetMember.timeout(null, reason);
		const infraction = await trpc.infraction.find.query({
			target: { userId: target.id, guildId: interaction.guildId },
			type: 'TIMEOUT'
		});
		if (infraction) {
			await trpc.infraction.update.mutate({ id: infraction.id, active: false });
		}
		const embed = new EmbedBuilder()
			.setTitle('Cancelling Timeout...')
			.setDescription(`${Emojis.CHECK} Timeout canceled for ${target}`);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
