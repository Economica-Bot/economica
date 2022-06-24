import { EmbedBuilder, MessageComponentInteraction, PermissionsString } from 'discord.js';

import { Promisable } from '../typings';
import { Context } from './Context';

export class ExecutionBuilder {
	public ctx: Context;
	public name: string;
	public value: string;
	public description: string;
	public embed: EmbedBuilder;
	public enabled = true;
	public permissions: PermissionsString[] = [];
	public execution: (ctx: Context, interaction?: MessageComponentInteraction<'cached'>) => Promise<void | ExecutionBuilder>;
	public options: ExecutionBuilder[] = [];

	public elements: (ctx: Context) => Promisable<any[]>;
	public func: (t: any, ctx: Context) => ExecutionBuilder;

	public setCtx(ctx: Context) {
		this.ctx = ctx;
		return this;
	}

	public setName(name: string) {
		this.name = name;
		return this;
	}

	public setValue(value: string) {
		this.value = value;
		return this;
	}

	public setDescription(description: string) {
		this.description = description;
		return this;
	}

	public setEmbed(embed: EmbedBuilder) {
		this.embed = embed;
		return this;
	}

	public setEnabled(enabled: boolean) {
		this.enabled = enabled;
		return this;
	}

	public setPermissions(permissions: PermissionsString[]) {
		this.permissions = permissions;
		return this;
	}

	public setExecution(input: typeof this.execution) {
		this.execution = input;
		return this;
	}

	public setOptions(options: ExecutionBuilder[]) {
		this.options = options;
		return this;
	}

	public setPagination<T>(elements: (ctx: Context) => Promisable<T[]>, func: (t: T, ctx: Context) => ExecutionBuilder) {
		this.elements = elements;
		this.func = func;
		return this;
	}
}
