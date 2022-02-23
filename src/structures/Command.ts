import {
	Context,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandOptionsOnlyBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandsOnlyBuilder,
} from './index.js';

export class Command {
	public data:
	| EconomicaSlashCommandBuilder
	| EconomicaSlashCommandSubcommandBuilder
	| EconomicaSlashCommandSubcommandsOnlyBuilder
	| EconomicaSlashCommandOptionsOnlyBuilder
	| Omit<EconomicaSlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

	public execute: (ctx: Context) => Promise<void>;
}
