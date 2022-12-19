import { Emojis } from '@economica/common';
import { EmbedBuilder } from 'discord.js';

import { recordInfraction } from '../lib';
import { validateTarget } from '../lib/moderation';
import { trpc } from '../lib/trpc';
import { Command } from '../structures/commands';

export const Kick = {
	identifier: /^kick$/,
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
		const reason =
			interaction.options.getString('reason') ?? 'No reason provided';
		await targetMember.kick(reason);
		await recordInfraction(
			interaction.guildId,
			target.id,
			interaction.user.id,
			'KICK',
			reason
		);
		const embed = new EmbedBuilder()
			.setTitle('Kicking...')
			.setDescription(`${Emojis.CHECK} Kicked ${target}`);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
