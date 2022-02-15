import { Message } from 'discord.js';

import {
	EconomicaSlashCommandBuilder,
	EconomicaSlashCommandOptionsOnlyBuilder,
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
	EconomicaSlashCommandSubcommandsOnlyBuilder,
} from '.';
import { Context } from './Context';

export interface EconomicaCommand {
	data:
		| EconomicaSlashCommandBuilder
		| EconomicaSlashCommandSubcommandBuilder
		| EconomicaSlashCommandSubcommandsOnlyBuilder
		| EconomicaSlashCommandOptionsOnlyBuilder
		| Omit<EconomicaSlashCommandBuilder, 'addEconomicaSubcommand' | 'addEconomicaSubcommandGroup'>;

	execute(ctx: Context): Promise<Message | void>;
}
