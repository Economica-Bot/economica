import { Context } from './Context';
import {
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
	execute: (ctx: Context) => Promise<any>;
}
