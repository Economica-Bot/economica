import { SlashCommandBuilder } from '@discordjs/builders';
import { SharedSlashCommandOptions } from '@discordjs/builders/dist/interactions/slashCommands/mixins/CommandOptions';
import { SharedNameAndDescription } from '@discordjs/builders/dist/interactions/slashCommands/mixins/NameAndDescription';
import { CommandInteraction, PermissionResolvable } from 'discord.js';
import { PermissionRole } from './CommandOptions';
import {
	EconomicaSlashCommandSubcommandBuilder,
	EconomicaSlashCommandSubcommandGroupBuilder,
} from './EconomicaSlashCommandSubcommands';

export class EconomicaSlashCommandBuilder extends SlashCommandBuilder {
	global: boolean;
	group: string;
	format: string;
	examples: string[];
	userPermissions: PermissionResolvable[];
	clientPermissions: PermissionResolvable[];
	roles: PermissionRole[];
	enabled: boolean = true;

	setGlobal(global: boolean): this {
		this.global = global;
		return this;
	}

	setGroup(group: string): this {
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

	setUserPermissions(userPermissions: PermissionResolvable[]): this {
		this.userPermissions = userPermissions;
		return this;
	}

	setClientPermissions(clientPermissions: PermissionResolvable[]): this {
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
		interaction: CommandInteraction
	): EconomicaSlashCommandSubcommandGroupBuilder {
		const subcommandgroup = this.options.find(
			(
				builder:
					| EconomicaSlashCommandSubcommandGroupBuilder
					| EconomicaSlashCommandSubcommandBuilder
			) => {
				return (
					builder instanceof EconomicaSlashCommandSubcommandGroupBuilder &&
					builder.name === interaction.options.getSubcommandGroup()
				);
			}
		) as EconomicaSlashCommandSubcommandGroupBuilder;
		return subcommandgroup ?? undefined;
	}

	public getSubcommand(
		interaction: CommandInteraction
	): EconomicaSlashCommandSubcommandBuilder {
		const builder = this.options.find(
			(
				builder:
					| EconomicaSlashCommandSubcommandGroupBuilder
					| EconomicaSlashCommandSubcommandBuilder
			) => {
				return (
					(builder instanceof EconomicaSlashCommandSubcommandGroupBuilder &&
						builder.name === interaction.options.getSubcommandGroup() &&
						builder.options.find(
							(subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) =>
								subcommandbuilder.name === interaction.options.getSubcommand()
						)) ||
					(builder instanceof EconomicaSlashCommandSubcommandBuilder &&
						builder.name === interaction.options.getSubcommand())
				);
			}
		) as
			| EconomicaSlashCommandSubcommandGroupBuilder
			| EconomicaSlashCommandSubcommandBuilder;
		if (
			builder &&
			builder instanceof EconomicaSlashCommandSubcommandGroupBuilder
		) {
			return (
				(builder.options.find(
					(subcommandbuilder: EconomicaSlashCommandSubcommandBuilder) =>
						subcommandbuilder.name === interaction.options.getSubcommand()
				) as EconomicaSlashCommandSubcommandBuilder) ?? undefined
			);
		} else if (builder instanceof EconomicaSlashCommandSubcommandBuilder)
			return builder ?? undefined;
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
	extends SharedNameAndDescription,
		Pick<
			EconomicaSlashCommandBuilder,
			'toJSON' | 'addEconomicaSubcommand' | 'addEconomicaSubcommandGroup'
		> {}

export interface EconomicaSlashCommandOptionsOnlyBuilder
	extends SharedNameAndDescription,
		SharedSlashCommandOptions,
		Pick<EconomicaSlashCommandBuilder, 'toJSON'> {}
