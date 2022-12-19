import { IntervalString, TransactionString } from '@economica/common';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { recordTransaction } from './transaction';
import { trpc } from './trpc.js';

const intervals: Record<IntervalString, TransactionString> = {
	minutely: 'INTERVAL_MINUTE',
	hourly: 'INTERVAL_HOUR',
	daily: 'INTERVAL_MINUTE',
	fortnightly: 'INTERVAL_FORTNIGHT',
	monthly: 'INTERVAL_MONTH',
	weekly: 'INTERVAL_WEEK'
};

export async function interval(
	interaction: ChatInputCommandInteraction<'cached'>,
	type: keyof typeof intervals
): Promise<void> {
	const guildEntity = await trpc.guild.byId.query({ id: interaction.guildId });
	if (!guildEntity.intervals[type].enabled)
		throw new Error('This interval command is disabled.');
	const { amount } = guildEntity.intervals[type];
	await recordTransaction(
		interaction.guildId,
		interaction.user.id,
		interaction.client.user.id,
		intervals[type],
		amount,
		0
	);
	const embed = new EmbedBuilder()
		.setTitle('Success')
		.setDescription(`You earned ${guildEntity.currency} \`${amount}\`!`);
	await interaction.reply({ embeds: [embed] });
}
