import {
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import { PermissionString } from 'discord.js';

import { Authority, GroupString } from '../typings';

export class EconomicaSlashCommandBuilder extends SlashCommandBuilder {
	group: GroupString;
	format: string;
	examples: string[];
	clientPermissions: PermissionString[];
	global: boolean = false;
	enabled: boolean = true;
	authority: Authority;

	setGlobal(global: boolean): this {
		this.global = global;
		return this;
	}

	setGroup(group: GroupString): this {
		this.group = group;
		return this;
	}

	setFormat(format: string): this {
		this.format = format;
		return this;
	}

	setExamples(examples: string[]): this {
		this.examples = examples;
		return this;
	}

	setClientPermissions(clientPermissions: PermissionString[]): this {
		this.clientPermissions = clientPermissions;
		return this;
	}

	setAuthority(level: Authority): this {
		this.authority = level;
		return this;
	}

	setEnabled(enabled: boolean): this {
		this.enabled = enabled;
		return this;
	}

	addEconomicaSubcommandGroup(
		input: (subcommandGroup: EconomicaSlashCommandSubcommandGroupBuilder) => EconomicaSlashCommandSubcommandGroupBuilder
	): EconomicaSlashCommandSubcommandsOnlyBuilder {
		const { options } = this;
		const result = input(new EconomicaSlashCommandSubcommandGroupBuilder());
		options.push(result);
		return this;
	}

	addEconomicaSubcommand(
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
		return {
			...super.toJSON(),
			global: this.global,
			group: this.group,
			format: this.format,
			clientPermissions: this.clientPermissions,
			authority: this.authority,
		};
	}
}

export class EconomicaSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
	clientPermissions: PermissionString[];
	authority: Authority;

	setClientPermissions(clientPermissions: PermissionString[]): this {
		this.clientPermissions = clientPermissions;
		return this;
	}

	setAuthority(authority: Authority): this {
		this.authority = authority;
		return this;
	}

	addEconomicaSubcommand(
		input: (subcommandGroup: EconomicaSlashCommandSubcommandBuilder) => EconomicaSlashCommandSubcommandBuilder
	): this {
		const { options } = this;
		const result = input(new EconomicaSlashCommandSubcommandBuilder());
		options.push(result);
		return this;
	}

	toJSON() {
		return {
			...super.toJSON(),
			clientPermissions: this.clientPermissions,
			authority: this.authority,
		};
	}
}

export interface EconomicaSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {}

export class EconomicaSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
	format: string;
	examples: string[];
	clientPermissions: PermissionString[];
	authority: Authority;

	setFormat(format: string): this {
		this.format = format;
		return this;
	}

	setExamples(examples: string[]): this {
		this.examples = examples;
		return this;
	}

	setClientPermissions(clientPermissions: PermissionString[]): this {
		this.clientPermissions = clientPermissions;
		return this;
	}

	setAuthority(authority: Authority): this {
		this.authority = authority;
		return this;
	}

	toJSON() {
		return {
			...super.toJSON(),
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
