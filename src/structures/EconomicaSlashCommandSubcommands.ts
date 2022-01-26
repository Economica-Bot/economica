import {
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
} from '@discordjs/builders';
import { PermissionString } from 'discord.js';
import { Authority, PermissionRole } from '.';

export class EconomicaSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
	userPermissions: PermissionString[];
	clientPermissions: PermissionString[];
	roles: PermissionRole[];
	authority: Authority;

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

	setAuthority(authority: Authority): this {
		this.authority = authority;
		return this;
	}

	addEconomicaSubcommand(
		input: (
			subcommandGroup: EconomicaSlashCommandSubcommandBuilder
		) => EconomicaSlashCommandSubcommandBuilder
	): this {
		const { options } = this;
		const result = input(new EconomicaSlashCommandSubcommandBuilder());
		options.push(result);
		return this;
	}

	toJSON() {
		return {
			...super.toJSON(),
			userPermissions: this.userPermissions,
			clientPermissions: this.clientPermissions,
			roles: this.roles,
		};
	}
}

export interface EconomicaSlashCommandSubcommandGroupBuilder
	extends SlashCommandSubcommandGroupBuilder {}

export class EconomicaSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
	format: string;
	examples: string[];
	userPermissions: PermissionString[];
	clientPermissions: PermissionString[];
	roles: PermissionRole[];
	authority: Authority;

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

	setAuthority(authority: Authority): this {
		this.authority = authority;
		return this;
	}

	toJSON() {
		return {
			...super.toJSON(),
			userPermissions: this.userPermissions,
			clientPermissions: this.clientPermissions,
			roles: this.roles,
		};
	}
}

export interface EconomicaSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {}
