import { ChannelType, EmbedBuilder } from 'discord.js';
import { Command } from '../structures/commands';

export const Purge = {
	identifier: /^purge$/,
	type: 'chatInput',
	execute: async ({ interaction }) => {
		const channel =
			interaction.options.getChannel('channel') ?? interaction.channel;
		if (channel?.type !== ChannelType.GuildText)
			throw new Error('Must be a guild channel.');
		if (
			!channel
				.permissionsFor(await interaction.guild.members.fetchMe())
				.has('ManageMessages')
		)
			throw new Error('I need `MANAGE_MESSAGES` in that channel.');

		const amount = interaction.options.getInteger('amount') ?? 100;
		const count = await channel.bulkDelete(amount, true);
		const embed = new EmbedBuilder()
			.setTitle('Succces')
			.setDescription(`Deleted \`${count.size}\` message(s).`);
		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
} satisfies Command<'chatInput'>;
