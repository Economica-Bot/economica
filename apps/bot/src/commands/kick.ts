import { Emojis } from '@economica/common';
import { datasource, Member, User } from '@economica/db';
import { EmbedBuilder } from 'discord.js';

import { recordInfraction } from '../lib';
import { validateTarget } from '../lib/moderation';
import { Command } from '../structures/commands';

export const Kick = {
	identifier: /^kick$/,
	type: 'chatInput',
	execute: async ({ interaction }) => {
		await validateTarget(interaction);
		const target = interaction.options.getUser('target', true);
		const targetMember = await interaction.guild.members.fetch({
			user: target
		});
		await datasource.getRepository(User).save({ id: target.id });
		await datasource
			.getRepository(Member)
			.save({ userId: target.id, guildId: interaction.guildId });
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
