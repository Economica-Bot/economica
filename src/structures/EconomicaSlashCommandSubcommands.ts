import { SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from '@discordjs/builders';
import { PermissionResolvable } from 'discord.js';
import { PermissionRole } from './CommandOptions';
import { EconomicaSlashCommandBuilder } from './EconomicaSlashCommandBuilder';

export class EconomicaSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
	public userPermissions: PermissionResolvable[];
	public clientPermissions: PermissionResolvable[];
	public roles: PermissionRole[];

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

	addEconomicaSubcommand(input: EconomicaSlashCommandSubcommandBuilder | ((subcommandGroup: EconomicaSlashCommandSubcommandBuilder) => EconomicaSlashCommandSubcommandBuilder)): this {
		const { options } = this;
		const result = typeof input === 'function' ? input(new EconomicaSlashCommandSubcommandBuilder()) : input;

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

export interface EconomicaSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {}

export class EconomicaSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
	userPermissions: PermissionResolvable[];
	clientPermissions: PermissionResolvable[];
	roles: PermissionRole[];

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
