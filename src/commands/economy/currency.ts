import { CommandInteraction, Guild } from 'discord.js';
import { guildDocument } from '../../models';
import {
	Context,
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	PermissionRole,
} from '../../structures';
import config from '../../../config.json';

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
				.addStringOption((option) =>
					option.setName('currency').setDescription('Specify a symbol.').setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('reset')
				.setDescription('Reset the currency symbol.')
				.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
		);

	execute = async (ctx: Context) => {
		const subcommand = ctx.interaction.options.getSubcommand();
		const guildID = ctx.interaction.guildId;
		const { currency } = ctx.guildDocument;
		if (subcommand === 'view') {
			return await ctx.interaction.reply(`Currency symbol: ${currency}`);
		} else if (subcommand === 'set') {
			await guildDocument.findOneAndUpdate({ guildID }, { currency });
			return await ctx.interaction.reply(`Currency symbol set to ${currency}`);
		} else if (subcommand === 'reset') {
			const currency = config.cSymbol;
			await guildDocument.findOneAndUpdate({ guildID }, { currency });
			return await ctx.interaction.reply(`Currency symbol reset: ${currency}`);
		}
	};
}
