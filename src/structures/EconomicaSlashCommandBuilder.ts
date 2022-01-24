import {
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders';
import { PermissionString } from 'discord.js';
import { Group } from '.';
import { PermissionRole } from './CommandOptions';
import {
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from './EconomicaSlashCommandSubcommands';

export class EconomicaSlashCommandBuilder extends SlashCommandBuilder {
	group: Group;
	format: string;
	examples: string[];
	userPermissions: PermissionString[];
	clientPermissions: PermissionString[];
	roles: PermissionRole[];
	global: boolean = false;
	devOnly: boolean = false;
	enabled: boolean = true;
	authority: 'mod' | 'manager' | 'admin' = null;

	setGlobal(global: boolean): this {
		this.global = global;
		return this;
	}

	setGroup(group: Group): this {
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

	setUserPermissions(userPermissions: PermissionString[]): this {
		this.userPermissions = userPermissions;
		return this;
	}

	setClientPermissions(clientPermissions: PermissionString[]): this {
		this.clientPermissions = clientPermissions;
		return this;
	}

	setRoles(roles: PermissionRole[]): this {
		this.roles = roles;
		return this;
	}

	setEnabled(enabled: boolean): this {
		this.enabled = enabled;
		return this;
	}

	setDevOnly(devOnly: boolean): this {
		this.devOnly = devOnly;
		return this;
	}

	setAuthority(level: 'mod' | 'manager' | 'admin'): this {
		this.authority = level;
		return this;
	}

	addEconomicaSubcommandGroup(
		input: (
			subcommandGroup: EconomicaSlashCommandSubcommandGroupBuilder
		) => EconomicaSlashCommandSubcommandGroupBuilder
	): EconomicaSlashCommandSubcommandsOnlyBuilder {
		const { options } = this;
		const result = input(new EconomicaSlashCommandSubcommandGroupBuilder());
		options.push(result);
		return this;
	}

	addEconomicaSubcommand(
		input: (
			subcommandGroup: EconomicaSlashCommandSubcommandBuilder
		) => EconomicaSlashCommandSubcommandBuilder
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
						(subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) =>
							subcommandbuilder.name === query
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
						(subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) =>
							subcommandbuilder.name === query
					)) ||
				(builder instanceof EconomicaSlashCommandSubcommandBuilder && builder.name === query)
			);
		}) as EconomicaSlashCommandSubcommandGroupBuilder | EconomicaSlashCommandSubcommandBuilder;

		if (builder && builder instanceof EconomicaSlashCommandSubcommandGroupBuilder) {
			return (
				(builder.options.find(
					(subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) =>
						subcommandbuilder.name === query
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
			userPermissions: this.userPermissions,
			clientPermissions: this.clientPermissions,
			roles: this.roles,
		};
	}
}

export interface EconomicaSlashCommandBuilder extends SlashCommandBuilder {}

export interface EconomicaSlashCommandSubcommandsOnlyBuilder
	extends Omit<
			SlashCommandSubcommandsOnlyBuilder,
			'toJSON' | 'addSubcommand' | 'addSubcommandGroup'
		>,
		Pick<
			EconomicaSlashCommandBuilder,
			'toJSON' | 'addEconomicaSubcommand' | 'addEconomicaSubcommandGroup'
		> {}

export interface EconomicaSlashCommandOptionsOnlyBuilder
	extends Omit<SlashCommandOptionsOnlyBuilder, 'toJSON'>,
		Pick<EconomicaSlashCommandBuilder, 'toJSON'> {}
