import { CommandInteraction } from 'discord.js';
import {
	EconomicaClient,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandOptionsOnlyBuilder,
	EconomicaSlashCommandSubcommandsOnlyBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from './index';

export class EconomicaCommand {
	data:
		| EconomicaSlashCommandBuilder
		| EconomicaSlashCommandSubcommandGroupBuilder
		| EconomicaSlashCommandSubcommandBuilder
		| EconomicaSlashCommandSubcommandsOnlyBuilder
		| EconomicaSlashCommandOptionsOnlyBuilder
		| Omit<EconomicaSlashCommandBuilder, 'addEconomicaSubcommand' | 'addEconomicaSubcommandGroup'>;
	execute: (client: EconomicaClient, interaction: CommandInteraction) => Promise<any>;
}
