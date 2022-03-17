/* eslint-disable max-classes-per-file */
import {
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import { PermissionsString } from 'discord.js';
import { Authorities, ModuleString } from '../typings/index.js';

export class EconomicaSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
	public clientPermissions: PermissionsString[];

	public setClientPermissions(clientPermissions: PermissionsString[]): this {
		this.clientPermissions = clientPermissions;
		return this;
	}
}

export class EconomicaSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
	public clientPermissions: PermissionsString[];
	public declare options: EconomicaSlashCommandSubcommandBuilder[];

	public setClientPermissions(clientPermissions: PermissionsString[]): this {
		this.clientPermissions = clientPermissions;
		return this;
	}

	public override addSubcommand(input: (subcommandGroup: EconomicaSlashCommandSubcommandBuilder) => EconomicaSlashCommandSubcommandBuilder): this {
		const result = input(new EconomicaSlashCommandSubcommandBuilder());
		this.options.push(result);
		return this;
	}
}

export class EconomicaSlashCommandBuilder extends SlashCommandBuilder {
	public module: ModuleString;
	public format: string;
	public examples: string[];
	public clientPermissions: PermissionsString[];
	public global = false;
	public enabled = true;
	public authority: Authorities;

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

	public setClientPermissions(clientPermissions: PermissionsString[]): this {
		this.clientPermissions = clientPermissions;
		return this;
	}

	public setAuthority(level: keyof typeof Authorities): this {
		this.authority = Authorities[level];
		return this;
	}

	public setEnabled(enabled: boolean): this {
		this.enabled = enabled;
		return this;
	}

	public override addSubcommandGroup(input: (subcommandGroup: EconomicaSlashCommandSubcommandGroupBuilder) => EconomicaSlashCommandSubcommandGroupBuilder): EconomicaSlashCommandSubcommandsOnlyBuilder {
		const result = input(new EconomicaSlashCommandSubcommandGroupBuilder());
		this.options.push(result);
		return this;
	}

	public override addSubcommand(input: (subcommandGroup: EconomicaSlashCommandSubcommandBuilder) => EconomicaSlashCommandSubcommandBuilder): EconomicaSlashCommandSubcommandsOnlyBuilder {
		const result = input(new EconomicaSlashCommandSubcommandBuilder());
		this.options.push(result);
		return this;
	}

	public getSubcommandGroup(query?: string): EconomicaSlashCommandSubcommandGroupBuilder[] {
		if (!query) return this.options.filter((option) => option instanceof EconomicaSlashCommandSubcommandGroupBuilder) as EconomicaSlashCommandSubcommandGroupBuilder[];
		const builder = this.options.find((option) => (
			option instanceof EconomicaSlashCommandSubcommandGroupBuilder
			&& (option.name === query || option.options.find((subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) => subcommandbuilder.name === query)))) as EconomicaSlashCommandSubcommandGroupBuilder;
		return [builder];
	}

	public getSubcommand(query?: string): EconomicaSlashCommandSubcommandBuilder[] {
		if (!query) return this.options.filter((option) => option instanceof EconomicaSlashCommandSubcommandBuilder) as EconomicaSlashCommandSubcommandBuilder[];
		const builder = this.options.find((option) => (
			option instanceof EconomicaSlashCommandSubcommandGroupBuilder
				&& option.options.find((subcommandbuilder) => subcommandbuilder.name === query))
			|| (option instanceof EconomicaSlashCommandSubcommandBuilder && option.name === query)) as EconomicaSlashCommandSubcommandGroupBuilder | EconomicaSlashCommandSubcommandBuilder;
		if (builder instanceof EconomicaSlashCommandSubcommandGroupBuilder) return [builder.options.find((subcommandbuilder) => subcommandbuilder.name === query) as EconomicaSlashCommandSubcommandBuilder];
		if (builder instanceof EconomicaSlashCommandSubcommandBuilder) return [builder];
		return undefined;
	}
}

export interface EconomicaSlashCommandSubcommandsOnlyBuilder extends
	Omit<SlashCommandSubcommandsOnlyBuilder, 'toJSON' | 'addSubcommand' | 'addSubcommandGroup'>,
	Pick<EconomicaSlashCommandBuilder, 'toJSON' | 'addSubcommand' | 'addSubcommandGroup'> {}
export interface EconomicaSlashCommandOptionsOnlyBuilder extends
	Omit<SlashCommandOptionsOnlyBuilder, 'toJSON'>,
	Pick<EconomicaSlashCommandBuilder, 'toJSON'> {}
