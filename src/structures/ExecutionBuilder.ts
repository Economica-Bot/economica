import { Awaitable, EmbedBuilder, MessageComponentInteraction, PermissionsString } from 'discord.js';

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

	public elements: (ctx: Context) => Awaitable<unknown[]>;
	public func: (t: unknown, ctx: Context) => ExecutionBuilder;

	public variableCollectors: { property: string, prompt: string, validators: { function: (ctx: Context, input: string) => Awaitable<boolean>, error: string }[], parse: (ctx: Context, input: string) => Awaitable<unknown>, skippable?: boolean }[] = [];
	public variables: Record<string, any> = {};

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

	public setPagination<T>(elements: (ctx: Context) => Awaitable<T[]>, func: (t: T, ctx: Context) => ExecutionBuilder) {
		this.elements = elements;
		this.func = func;
		return this;
	}

	public collectVar(input: typeof this.variableCollectors[0]) {
		const { property, prompt, validators, parse, skippable } = input;
		this.variableCollectors.push({ property, prompt, validators, parse, skippable });
		return this;
	}

	public getVariable(input: string, ex: ExecutionBuilder = this) {
		if (ex.variables[input]) return ex.variables[input];
		// eslint-disable-next-line no-restricted-syntax
		for (const option of ex.options) {
			const res = this.getVariable(input, option);
			if (res) return res;
		}

		return null;
	}
}
