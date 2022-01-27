import { CURRENCY } from '../../config';
import { GuildModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder, PermissionRole } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('currency')
		.setDescription('View or update the currency symbol.')
		.setGroup('economy')
		.setFormat('<view | set | reset> [currency]')
		.setGlobal(false)
		.addEconomicaSubcommand((subcommand) =>
			subcommand.setName('view').setDescription('View the current currency symbol.')
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Set the currency symbol')
				.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
				.addStringOption((option) => option.setName('currency').setDescription('Specify a symbol.').setRequired(true))
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('reset')
				.setDescription('Reset the currency symbol.')
				.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
		);

	execute = async (ctx: Context) => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const guildId = ctx.interaction.guildId;
		const { currency } = ctx.guildDocument;
		if (subcommand === 'view') {
			return await ctx.embedify('success', 'guild', `Currency symbol: ${currency}`);
		} else if (subcommand === 'set') {
			const newCurrency = ctx.interaction.options.getString('currency');
			await GuildModel.findOneAndUpdate({ guildId }, { currency: newCurrency });
			return await ctx.embedify('success', 'guild', `Currency symbol set to ${newCurrency}`);
		} else if (subcommand === 'reset') {
			await GuildModel.findOneAndUpdate({ guildId }, { currency: CURRENCY });
			return await ctx.embedify('success', 'guild', `Currency symbol reset: ${currency}`);
		}
	};
}
