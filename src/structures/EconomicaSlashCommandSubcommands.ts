import { SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from '@discordjs/builders';
import { PermissionString } from 'discord.js';

import { Authority } from '.';

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
