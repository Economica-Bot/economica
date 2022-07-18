import { EconomicaSlashCommandBuilder, ExecutionBuilder } from '.';

export class Command {
	public data: Partial<EconomicaSlashCommandBuilder>;
	public execute: ExecutionBuilder;
}
