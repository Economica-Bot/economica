import {
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import { PermissionString } from 'discord.js';

import { Module } from '../config';
import { Authority } from '../typings';

export class EconomicaSlashCommandBuilder extends SlashCommandBuilder {
	public group: Module;
	public format: string;
	public examples: string[];
	public clientPermissions: PermissionString[];
	public global: boolean = false;
	public enabled: boolean = true;
	public authority: Authority;

	public setGlobal(global: boolean): this {
		this.global = global;
		return this;
	}

	public setModule(group: Module): this {
		this.group = group;
		return this;
	}

	public setFormat(format: string): this {
		this.format = format;
		return this;
	}

	public setExamples(examples: string[]): this {
		this.examples = examples;
		return this;
	}

	public setClientPermissions(clientPermissions: PermissionString[]): this {
		this.clientPermissions = clientPermissions;
		return this;
	}

	public setAuthority(level: Authority): this {
		this.authority = level;
		return this;
	}

	public setEnabled(enabled: boolean): this {
		this.enabled = enabled;
		return this;
	}

	public addEconomicaSubcommandGroup(
		input: (subcommandGroup: EconomicaSlashCommandSubcommandGroupBuilder) => EconomicaSlashCommandSubcommandGroupBuilder
	): EconomicaSlashCommandSubcommandsOnlyBuilder {
		const { options } = this;
		const result = input(new EconomicaSlashCommandSubcommandGroupBuilder());
		options.push(result);
		return this;
	}

	public addEconomicaSubcommand(
		input: (subcommandGroup: EconomicaSlashCommandSubcommandBuilder) => EconomicaSlashCommandSubcommandBuilder
	): EconomicaSlashCommandSubcommandsOnlyBuilder {
		const { options } = this;
		const result = input(new EconomicaSlashCommandSubcommandBuilder());
		options.push(result);
		return this;
	}

	public getSubcommandGroup(
		query?: string
	): EconomicaSlashCommandSubcommandGroupBuilder | EconomicaSlashCommandSubcommandGroupBuilder[] {
		if (!query) {
			return this.options.filter(
				(builder) => builder instanceof EconomicaSlashCommandSubcommandGroupBuilder
			) as EconomicaSlashCommandSubcommandGroupBuilder[];
		}
		const subcommandgroup = this.options.find((builder) => {
			return (
				builder instanceof EconomicaSlashCommandSubcommandGroupBuilder &&
				(builder.name === query ||
					builder.options.find(
						(subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) => subcommandbuilder.name === query
					))
			);
		}) as EconomicaSlashCommandSubcommandGroupBuilder;
		return subcommandgroup ?? undefined;
	}

	public getSubcommand(
		query?: string
	): EconomicaSlashCommandSubcommandBuilder | EconomicaSlashCommandSubcommandBuilder[] {
		if (!query) {
			return this.options.filter(
				(builder) => builder instanceof EconomicaSlashCommandSubcommandBuilder
			) as EconomicaSlashCommandSubcommandBuilder[];
		}
		const builder = this.options.find((builder) => {
			return (
				(builder instanceof EconomicaSlashCommandSubcommandGroupBuilder &&
					builder.options.find(
						(subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) => subcommandbuilder.name === query
					)) ||
				(builder instanceof EconomicaSlashCommandSubcommandBuilder && builder.name === query)
			);
		}) as EconomicaSlashCommandSubcommandGroupBuilder | EconomicaSlashCommandSubcommandBuilder;

		if (builder && builder instanceof EconomicaSlashCommandSubcommandGroupBuilder) {
			return (
				(builder.options.find(
					(subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) => subcommandbuilder.name === query
				) as EconomicaSlashCommandSubcommandBuilder) ?? undefined
			);
		} else if (builder instanceof EconomicaSlashCommandSubcommandBuilder) {
			return builder ?? undefined;
		}
	}

	public toJSON() {
		return super.toJSON();
	}
}

export class EconomicaSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
	public clientPermissions: PermissionString[];
	public authority: Authority;

	public setClientPermissions(clientPermissions: PermissionString[]): this {
		this.clientPermissions = clientPermissions;
		return this;
	}

	public setAuthority(authority: Authority): this {
		this.authority = authority;
		return this;
	}

	public addEconomicaSubcommand(
		input: (subcommandGroup: EconomicaSlashCommandSubcommandBuilder) => EconomicaSlashCommandSubcommandBuilder
	): this {
		const { options } = this;
		const result = input(new EconomicaSlashCommandSubcommandBuilder());
		options.push(result);
		return this;
	}

	public toJSON() {
		return {
			...super.toJSON(),
			clientPermissions: this.clientPermissions,
			authority: this.authority,
		};
	}
}

export interface EconomicaSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {}

export class EconomicaSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
	public format: string;
	public examples: string[];
	public clientPermissions: PermissionString[];
	public authority: Authority;

	public setFormat(format: string): this {
		this.format = format;
		return this;
	}

	public setExamples(examples: string[]): this {
		this.examples = examples;
		return this;
	}

	public setClientPermissions(clientPermissions: PermissionString[]): this {
		this.clientPermissions = clientPermissions;
		return this;
	}

	public setAuthority(authority: Authority): this {
		this.authority = authority;
		return this;
	}

	public toJSON() {
		return {
			...super.toJSON(),
			format: this.format,
			examples: this.examples,
			clientPermissions: this.clientPermissions,
			authority: this.authority,
		};
	}
}

export interface EconomicaSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {}
export interface EconomicaSlashCommandBuilder extends SlashCommandBuilder {}
export interface EconomicaSlashCommandSubcommandsOnlyBuilder
	extends Omit<SlashCommandSubcommandsOnlyBuilder, 'toJSON' | 'addSubcommand' | 'addSubcommandGroup'>,
		Pick<EconomicaSlashCommandBuilder, 'toJSON' | 'addEconomicaSubcommand' | 'addEconomicaSubcommandGroup'> {}
export interface EconomicaSlashCommandOptionsOnlyBuilder
	extends Omit<SlashCommandOptionsOnlyBuilder, 'toJSON'>,
		Pick<EconomicaSlashCommandBuilder, 'toJSON'> {}
