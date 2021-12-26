import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionResolvable } from 'discord.js';
import { PermissionRole } from './CommandOptions';

export class EconomicaSlashCommandBuilder extends SlashCommandBuilder {
	global: Boolean;
	group: string;
	format: string;
	userPermissions: PermissionResolvable[];
	clientPermissions: PermissionResolvable[];
	roles: PermissionRole[];

	setGlobal(global: Boolean): this {
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
}

export interface EconomicaSlashCommandBuilder extends SlashCommandBuilder {}
