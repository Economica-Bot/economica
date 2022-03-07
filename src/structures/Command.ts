import {
	Context,
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandOptionsOnlyBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandsOnlyBuilder,
} from './index.js';

export class Command<TopLevelData = false> {
	public data:
	TopLevelData extends true ?
		EconomicaSlashCommandBuilder :
		| EconomicaSlashCommandBuilder
		| EconomicaSlashCommandSubcommandBuilder
		| EconomicaSlashCommandSubcommandsOnlyBuilder
		| EconomicaSlashCommandOptionsOnlyBuilder
		| Omit<EconomicaSlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

	public execute: (ctx: Context) => Promise<void>;
}
