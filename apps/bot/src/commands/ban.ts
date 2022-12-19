import { EmbedBuilder } from 'discord.js';
import ms from 'ms';

import { recordInfraction } from '../lib';
import { validateTarget } from '../lib/moderation';
import { trpc } from '../lib/trpc';
import { Command } from '../structures/commands';

export const Ban = {
	identifier: /^ban$/,
	type: 'chatInput',
	execute: async (interaction) => {
		await validateTarget(interaction);
		const target = interaction.options.getUser('target', true);
		const targetMember = await interaction.guild.members.fetch({
			user: target
		});
		await trpc.user.create.mutate({ id: target.id });
		await trpc.member.create.mutate({
			userId: target.id,
			guildId: interaction.guildId
		});
		const durationInput = interaction.options.getString('duration');
		const duration = durationInput ? ms(durationInput) : Infinity;
		const formattedDuration =
			duration === Infinity ? `**${ms(duration)}**` : '**Permanent**';
		const reason =
			interaction.options.getString('reason') ?? 'No reason provided';
		const deleteMessageDays = interaction.options.getNumber('days') ?? 0;
		await targetMember.ban({ deleteMessageDays, reason });
		await recordInfraction(
			interaction.guildId,
			target.id,
			interaction.user.id,
			'BAN',
			reason,
			duration,
			true
		);
		const embed = new EmbedBuilder()
			.setTitle('Banning...')
			.setDescription(`Banned ${target} | Length: ${formattedDuration}`);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
