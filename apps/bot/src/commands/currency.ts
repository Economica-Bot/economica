import { DefaultCurrencySymbol } from '@economica/common';
import { trpc } from '../lib/trpc';
import { Command } from '../structures/commands';

export const Currency = {
	identifier: /^currency$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const subcommand = interaction.options.getSubcommand();
		const guildEntity = await trpc.guild.byId.query({
			id: interaction.guildId
		});
		if (subcommand === 'view') {
			await interaction.reply({
				embeds: [
					{
						author: { name: `\`${guildEntity.currency}\`` },
						description: `Currency symbol: ${guildEntity.currency}`
					}
				]
			});
		} else if (subcommand === 'set') {
			const newCurrency = interaction.options.getString('currency', true);
			await trpc.guild.update.mutate({
				id: interaction.guildId,
				currency: newCurrency
			});
			await interaction.reply({
				embeds: [
					{
						author: { name: `Setting Currency (${newCurrency})` },
						description: `Currency symbol set to ${newCurrency}`
					}
				]
			});
		} else if (subcommand === 'reset') {
			await trpc.guild.update.mutate({
				id: interaction.guildId,
				currency: DefaultCurrencySymbol
			});
			await interaction.reply({
				embeds: [
					{
						author: { name: `Defaulting... (\`${DefaultCurrencySymbol}\`)` },
						description: `Currency symbol reset to default (${DefaultCurrencySymbol})`
					}
				]
			});
		}
	}
} satisfies Command<'chatInput'>;
