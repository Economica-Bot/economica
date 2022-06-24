import { ExecutionBuilder } from './ExecutionBuilder.js';
import { EconomicaSlashCommandBuilder } from './index.js';

export class Command {
	public data: Partial<EconomicaSlashCommandBuilder>;
	public execute: ExecutionBuilder;
}
