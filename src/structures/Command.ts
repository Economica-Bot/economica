/* eslint-disable max-classes-per-file */
import { ChatInputCommandInteraction, MessageComponentInteraction } from 'discord.js';

import { EconomicaSlashCommandBuilder } from '.';
import { Context } from './Context';

/* eslint-disable max-classes-per-file */

export class Command {
	public data: Partial<EconomicaSlashCommandBuilder>;

	public execution: ExecutionNode;
}

type ExecutionNodeType = 'top' | 'select' | 'display' | 'displayInline' | 'displayNumbered' | 'button' | 'back';
type ContextType<T> = Context<T extends 'top' ? ChatInputCommandInteraction<'cached'> : MessageComponentInteraction<'cached'>>;

export class ExecutionNode<T extends ExecutionNodeType = ExecutionNodeType> {
	public name: string;

	public data: (ctx: ContextType<T>) => Promise<unknown>;

	public resolver: (args: unknown) => ExecutionNode[];

	public value: string;

	public type: ExecutionNodeType;

	public description: string | ((ctx: Context) => string);

	public returnable: boolean = true;

	public destination: string;

	public endpoints: Map<string, ExecutionNodeType> = new Map();

	addEndpoint(destination: string, type: ExecutionNodeType) {
		this.endpoints.set(destination, type);
		return this;
	}

	public predicate: (ctx: ContextType<T>) => boolean = () => true;

	public options: (ctx: ContextType<T>) => ExecutionNode[] | Promise<ExecutionNode[]>;

	public execution: (ctx: ContextType<T>) => Promise<void> | void;

	public setName(name: string) {
		this.name = name;
		return this;
	}

	public setValue(value: string) {
		this.value = value;
		return this;
	}

	public setType(type: ExecutionNodeType) {
		this.type = type;
		return this;
	}

	public setDescription(description: typeof this.description) {
		this.description = description;
		return this;
	}

	public setReturnable(returnable: boolean = true) {
		this.returnable = returnable;
		return this;
	}

	public setDestination(destination: string) {
		this.destination = destination;
		return this;
	}

	public setPredicate(predicate: typeof this.predicate) {
		this.predicate = predicate;
		return this;
	}

	public setOptions(options: typeof this.options) {
		this.options = options;
		return this;
	}

	public setPagination<S>(data: (ctx: ContextType<T>) => Promise<S>, resolver: (args: S) => ExecutionNode[]) {
		this.data = data;
		this.resolver = resolver;
		return this;
	}

	public setExecution(input: typeof this.execution) {
		this.execution = input;
		return this;
	}
}

export class CommandError extends Error {
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, CommandError.prototype);
	}
}
