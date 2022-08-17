/* eslint-disable max-classes-per-file */
import { ChatInputCommandInteraction, MessageComponentInteraction } from 'discord.js';
import { RouteParameters } from 'express-serve-static-core';

import { EconomicaSlashCommandBuilder } from '.';
import { Context } from './Context';

export class Layer {
	path: string;

	handle: (ctx: Context, params: Object) => ExecutionNode | Promise<ExecutionNode>;

	constructor(path: string, handle: (ctx: Context, params: Object) => ExecutionNode | Promise<ExecutionNode>) {
		this.path = path;
		this.handle = handle;
	}
}

export class Router {
	stack: Layer[] = [];

	get<Route extends string, P = RouteParameters<Route>>(
		path: Route,
		handle: (ctx: Route extends '' ? ContextType<'top'> : ContextType<'sub'>, params: P) => ExecutionNode | Promise<ExecutionNode>,
	): this {
		const layer = new Layer(path, handle);
		this.stack.push(layer);
		return this;
	}
}

export class Command {
	public metadata: Partial<EconomicaSlashCommandBuilder>;

	public execution: Router;
}

export type ExecutionNodeType = 'top' | 'select' | 'display' | 'displayInline' | 'displayNumbered' | 'button' | 'back' | 'image';
type ContextType<T extends 'top' | 'sub'> = Context<T extends 'top' ? ChatInputCommandInteraction<'cached'> : MessageComponentInteraction<'cached'>>;

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
