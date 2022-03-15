import { CURRENCY_SYMBOL } from '../../config.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('currency')
		.setDescription('Manage the currency symbol')
		.setModule('ECONOMY')
		.setFormat('currency <view | set | reset> [currency]')
		.setExamples(['currency view', 'currency set 💵', 'currency reset'])
		.addSubcommand((subcommand) => subcommand.setName('view').setDescription('View the currency symbol'))
		.addSubcommand((subcommand) => subcommand
			.setName('set')
			.setDescription('Set the currency symbol')
			.setAuthority('MANAGER')
			.addStringOption((option) => option.setName('currency').setDescription('Specify a symbol').setRequired(true)))
		.addSubcommand((subcommand) => subcommand.setName('reset').setDescription('Reset the currency symbol').setAuthority('MANAGER'));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			await ctx.embedify('success', 'guild', `Currency symbol: ${ctx.guildEntity.currency}`).send();
		} else if (subcommand === 'set') {
			const newCurrency = ctx.interaction.options.getString('currency');
			ctx.guildEntity.currency = newCurrency;
			await ctx.guildEntity.save();
			await ctx.embedify('success', 'guild', `Currency symbol set to ${newCurrency}`).send();
		} else if (subcommand === 'reset') {
			ctx.guildEntity.currency = CURRENCY_SYMBOL;
			await ctx.guildEntity.save();
			await ctx.embedify('success', 'guild', `Currency symbol reset to default (${CURRENCY_SYMBOL})`).send();
		}
	};
}
