import {
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
} from '@discordjs/builders';
import { PermissionString } from 'discord.js';
import { PermissionRole } from './CommandOptions';

export class EconomicaSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
	public userPermissions: PermissionString[];
	public clientPermissions: PermissionString[];
	public roles: PermissionRole[];

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

	addEconomicaSubcommand(
		input:
			| EconomicaSlashCommandSubcommandBuilder
			| ((
					subcommandGroup: EconomicaSlashCommandSubcommandBuilder
			  ) => EconomicaSlashCommandSubcommandBuilder)
	): this {
		const { options } = this;
		const result =
			typeof input === 'function' ? input(new EconomicaSlashCommandSubcommandBuilder()) : input;

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
	userPermissions: PermissionString[];
	clientPermissions: PermissionString[];
	roles: PermissionRole[];

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
