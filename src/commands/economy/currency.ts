import { CommandInteraction, Guild } from 'discord.js';
import { GuildModel } from '../../models';
import {
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

	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const subcommand = interaction.options.getSubcommand();
		const guildID = interaction.guildId;
		if (subcommand === 'view') {
			const currency = (await GuildModel.findOne({ guildID })).currency;
			return await interaction.reply(`Currency symbol: ${currency}`);
		} else if (subcommand === 'set') {
			const currency = interaction.options.getString('currency');
			await GuildModel.findOneAndUpdate({ guildID }, { currency });
			return await interaction.reply(`Currency symbol set to ${currency}`);
		} else if (subcommand === 'reset') {
			const currency = config.cSymbol;
			await GuildModel.findOneAndUpdate({ guildID }, { currency });
			return await interaction.reply(`Currency symbol reset: ${currency}`);
		}
	};
}