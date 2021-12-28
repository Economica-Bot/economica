import {
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandOptionsOnlyBuilder,
	EconomicaSlashCommandSubcommandsOnlyBuilder,
} from './EconomicaSlashCommandBuilder';
import {
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from './EconomicaSlashCommandSubcommands';

export default class EconomicaCommand {
	data:
		| EconomicaSlashCommandBuilder
		| EconomicaSlashCommandSubcommandGroupBuilder
		| EconomicaSlashCommandSubcommandBuilder
		| EconomicaSlashCommandSubcommandsOnlyBuilder
		| EconomicaSlashCommandOptionsOnlyBuilder
		| Omit<
				EconomicaSlashCommandBuilder,
				'addEconomicaSubcommand' | 'addEconomicaSubcommandGroup'
		  >;
	execute: Function;
}
