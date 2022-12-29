import { datasource, Member, User } from '@economica/db';
import { EmbedBuilder } from 'discord.js';
import ms from 'ms';

import { recordInfraction } from '../lib';
import { validateTarget } from '../lib/moderation';
import { Command } from '../structures/commands';

export const Timeout = {
	identifier: /^timeout$/,
	type: 'chatInput',
	execute: async (interaction) => {
		await validateTarget(interaction);
		const target = interaction.options.getUser('target', true);
		const targetMember = await interaction.guild.members.fetch({
			user: target
		});
		await datasource.getRepository(User).save({ id: target.id });
		await datasource
			.getRepository(Member)
			.upsert(
				{ userId: target.id, guildId: interaction.guildId },
				{ conflictPaths: ['userId', 'guildId'] }
			);
		const durationInput = interaction.options.getString('duration', true);
		const duration = ms(durationInput);
		if (duration > 1000 * 60 * 60 * 24 * 28)
			throw new Error('Timeout cannot exceed 28 days.');
		const reason =
			interaction.options.getString('reason') ?? 'No reason provided';
		await targetMember.timeout(duration, reason);
		await recordInfraction(
			interaction.guildId,
			target.id,
			interaction.user.id,
			'TIMEOUT',
			reason,
			duration,
			true
		);
		const embed = new EmbedBuilder()
			.setTitle('Timing out...')
			.setDescription(`Placed ${target} under a timeout for ${ms(duration)}.`);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
