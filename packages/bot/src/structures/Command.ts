/* eslint-disable max-classes-per-file */
import { Router } from 'express';

import { EconomicaSlashCommandBuilder } from '.';

export class Command {
	public metadata: EconomicaSlashCommandBuilder | Omit<EconomicaSlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

	public execution: Router;
}

export type ExecutionNodeType = 'top' | 'select' | 'display' | 'displayInline' | 'displayNumbered' | 'button' | 'back' | 'image';

type OptionType<T extends ExecutionNodeType>
	= T extends 'back' | 'image'
		? readonly [T, string]
		: T extends 'button'
			? readonly [T, string, string]
			: T extends 'display' | 'displayInline' | 'displayNumbered'
				? readonly [T, string, string]
				: readonly [T, string, string, string];

export class ExecutionNode {
	public name: string;

	public description: string;

	public options: OptionType<ExecutionNodeType>[] = [];

	public setName(name: string) {
		this.name = name;
		return this;
	}

	public setDescription(description: string) {
		this.description = description;
		return this;
	}

	public setOptions(...args: OptionType<ExecutionNodeType>[]) {
		this.options = args;
		return this;
	}
}

export class CommandError extends Error {
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, CommandError.prototype);
	}
}
