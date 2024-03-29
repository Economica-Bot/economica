import { Emojis } from '@economica/common';
import { datasource, Infraction } from '@economica/db';
import { EmbedBuilder } from 'discord.js';

import { validateTarget } from '../lib/moderation';
import { Command } from '../structures/commands';

export const Unban = {
	identifier: /^unban$/,
	type: 'chatInput',
	execute: async ({ interaction }) => {
		await validateTarget(interaction, false);
		const target = interaction.options.getUser('target', true);
		const ban = (await interaction.guild.bans.fetch()).get(target.id);
		if (!ban) throw new Error('Could not find banned user.');
		const reason =
			interaction.options.getString('reason') ?? 'No reason provided';
		await interaction.guild.members.unban(target, reason);
		const infraction = await datasource.getRepository(Infraction).findOneBy({
			target: { userId: target.id, guildId: interaction.guildId },
			type: 'BAN'
		});
		if (infraction) {
			await datasource
				.getRepository(Infraction)
				.update({ id: infraction.id }, { active: false });
		}
		const embed = new EmbedBuilder()
			.setTitle('Unbanning...')
			.setDescription(`${Emojis.CHECK} Unbanned ${target}`);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
