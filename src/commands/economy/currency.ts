import { Message } from 'discord.js';

import { CURRENCY_SYMBOL } from '../../config';
import { GuildModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('currency')
		.setDescription('View or update the currency symbol.')
		.setGroup('ECONOMY')
		.setFormat('<view | set | reset> [currency]')
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('view').setDescription('View the current currency symbol.')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Set the currency symbol')
				.setAuthority('MANAGER')
				.addStringOption((option) => option.setName('currency').setDescription('Specify a symbol.').setRequired(true))
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('reset').setDescription('Reset the currency symbol.').setAuthority('MANAGER')
		);

	public execute = async (ctx: Context): Promise<Message> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const guildId = ctx.interaction.guildId;
		const { currency } = ctx.guildDocument;
		if (subcommand === 'view') {
			return await ctx.embedify('success', 'guild', `Currency symbol: ${currency}`, false);
		} else if (subcommand === 'set') {
			const newCurrency = ctx.interaction.options.getString('currency');
			await GuildModel.findOneAndUpdate({ guildId }, { currency: newCurrency });
			return await ctx.embedify('success', 'guild', `Currency symbol set to ${newCurrency}`, false);
		} else if (subcommand === 'reset') {
			await GuildModel.findOneAndUpdate({ guildId }, { currency: CURRENCY_SYMBOL });
			return await ctx.embedify('success', 'guild', `Currency symbol reset: ${currency}`, false);
		}
	};
}
