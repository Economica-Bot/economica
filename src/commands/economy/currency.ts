import { PermissionFlagsBits } from 'discord.js';
import { CURRENCY_SYMBOL } from '../../config.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('currency')
		.setDescription('Manage the currency symbol')
		.setModule('ECONOMY')
		.setFormat('currency <view | set | reset> [currency]')
		.setExamples(['currency view', 'currency set 💵', 'currency reset'])
		.setPermissions(PermissionFlagsBits.ManageGuild.toString())
		.addSubcommand((subcommand) => subcommand.setName('view').setDescription('View the currency symbol'))
		.addSubcommand((subcommand) => subcommand
			.setName('set')
			.setDescription('Set the currency symbol')
			.addStringOption((option) => option.setName('currency').setDescription('Specify a symbol').setRequired(true)))
		.addSubcommand((subcommand) => subcommand.setName('reset').setDescription('Reset the currency symbol'));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			await ctx.embedify('success', { text: `\`${ctx.guildEntity.currency}\`` }, `Currency symbol: ${ctx.guildEntity.currency}`).send();
		} else if (subcommand === 'set') {
			const newCurrency = ctx.interaction.options.getString('currency');
			ctx.guildEntity.currency = newCurrency;
			await ctx.embedify('success', { text: `\`${ctx.guildEntity.currency}\`` }, `Currency symbol set to ${newCurrency}`).send();
			await ctx.guildEntity.save();
		} else if (subcommand === 'reset') {
			ctx.guildEntity.currency = CURRENCY_SYMBOL;
			await ctx.embedify('success', { text: `\`${ctx.guildEntity.currency}\`` }, `Currency symbol reset to default (${CURRENCY_SYMBOL})`).send();
			await ctx.guildEntity.save();
		}
	};
}
