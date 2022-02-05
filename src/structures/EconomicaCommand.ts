import { Message } from 'discord.js';

import {
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandOptionsOnlyBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
	EconomicaSlashCommandSubcommandsOnlyBuilder,
} from '.';
import { Context } from './Context';

export class EconomicaCommand {
	public data:
		| EconomicaSlashCommandBuilder
		| EconomicaSlashCommandSubcommandGroupBuilder
		| EconomicaSlashCommandSubcommandBuilder
		| EconomicaSlashCommandSubcommandsOnlyBuilder
		| EconomicaSlashCommandOptionsOnlyBuilder
		| Omit<EconomicaSlashCommandBuilder, 'addEconomicaSubcommand' | 'addEconomicaSubcommandGroup'>;

	public execute: (ctx: Context) => Promise<Message | void>;
}
