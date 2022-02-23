/* eslint-disable max-classes-per-file */
import {
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import { PermissionString } from 'discord.js';
import { Authorities, ModuleString } from '../typings';

export class EconomicaSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
	public format: string;
	public examples: string[];
	public clientPermissions: PermissionString[];
	public authority: keyof typeof Authorities;

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

	public setAuthority(authority: keyof typeof Authorities): this {
		this.authority = authority;
		return this;
	}
}

export class EconomicaSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
	public clientPermissions: PermissionString[];
	public authority: keyof typeof Authorities;

	public setClientPermissions(clientPermissions: PermissionString[]): this {
		this.clientPermissions = clientPermissions;
		return this;
	}

	public setAuthority(authority: keyof typeof Authorities): this {
		this.authority = authority;
		return this;
	}

	public override addSubcommand(
		input: (subcommandGroup: EconomicaSlashCommandSubcommandBuilder) => EconomicaSlashCommandSubcommandBuilder,
	): this {
		const { options } = this;
		const result = input(new EconomicaSlashCommandSubcommandBuilder());
		options.push(result);
		return this;
	}
}

export class EconomicaSlashCommandBuilder extends SlashCommandBuilder {
	public module: ModuleString;
	public format: string;
	public examples: string[];
	public clientPermissions: PermissionString[];
	public global = false;
	public enabled = true;
	public authority: keyof typeof Authorities;

	public setGlobal(global: boolean): this {
		this.global = global;
		return this;
	}

	public setModule(module: ModuleString): this {
		this.module = module;
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

	public setAuthority(level: keyof typeof Authorities): this {
		this.authority = level;
		return this;
	}

	public setEnabled(enabled: boolean): this {
		this.enabled = enabled;
		return this;
	}

	public override addSubcommandGroup(
		input: (subcommandGroup: EconomicaSlashCommandSubcommandGroupBuilder) => EconomicaSlashCommandSubcommandGroupBuilder,
	): EconomicaSlashCommandSubcommandsOnlyBuilder {
		const { options } = this;
		const result = input(new EconomicaSlashCommandSubcommandGroupBuilder());
		options.push(result);
		return this;
	}

	public override addSubcommand(
		input: (subcommandGroup: EconomicaSlashCommandSubcommandBuilder) => EconomicaSlashCommandSubcommandBuilder,
	): EconomicaSlashCommandSubcommandsOnlyBuilder {
		const { options } = this;
		const result = input(new EconomicaSlashCommandSubcommandBuilder());
		options.push(result);
		return this;
	}

	public getSubcommandGroup(
		query?: string,
	): EconomicaSlashCommandSubcommandGroupBuilder | EconomicaSlashCommandSubcommandGroupBuilder[] {
		if (!query) {
			return this.options.filter(
				(builder) => builder instanceof EconomicaSlashCommandSubcommandGroupBuilder,
			) as EconomicaSlashCommandSubcommandGroupBuilder[];
		}
		const subcommandgroup = this.options.find((builder) => (
			builder instanceof EconomicaSlashCommandSubcommandGroupBuilder
				&& (builder.name === query
					|| builder.options.find(
						(subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) => subcommandbuilder.name === query,
					))
		)) as EconomicaSlashCommandSubcommandGroupBuilder;
		return subcommandgroup ?? undefined;
	}

	public getSubcommand(
		query?: string,
	): EconomicaSlashCommandSubcommandBuilder | EconomicaSlashCommandSubcommandBuilder[] {
		if (!query) {
			return this.options.filter(
				(builder) => builder instanceof EconomicaSlashCommandSubcommandBuilder,
			) as EconomicaSlashCommandSubcommandBuilder[];
		}
		const builder = this.options.find((option) => (
			(option instanceof EconomicaSlashCommandSubcommandGroupBuilder
					&& option.options.find(
						(subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) => subcommandbuilder.name === query,
					))
				|| (builder instanceof EconomicaSlashCommandSubcommandBuilder && builder.name === query)
		)) as EconomicaSlashCommandSubcommandGroupBuilder | EconomicaSlashCommandSubcommandBuilder;

		if (builder && builder instanceof EconomicaSlashCommandSubcommandGroupBuilder) {
			return (
				(builder.options.find(
					(subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) => subcommandbuilder.name === query,
				) as EconomicaSlashCommandSubcommandBuilder) ?? undefined
			);
		} if (builder instanceof EconomicaSlashCommandSubcommandBuilder) {
			return builder ?? undefined;
		} return undefined;
	}
}

export interface EconomicaSlashCommandSubcommandsOnlyBuilder extends
	Omit<SlashCommandSubcommandsOnlyBuilder, 'toJSON' | 'addSubcommand' | 'addSubcommandGroup'>,
	Pick<EconomicaSlashCommandBuilder, 'toJSON' | 'addSubcommand' | 'addSubcommandGroup'> {}
export interface EconomicaSlashCommandOptionsOnlyBuilder extends
	Omit<SlashCommandOptionsOnlyBuilder, 'toJSON'>,
	Pick<EconomicaSlashCommandBuilder, 'toJSON'> {}
