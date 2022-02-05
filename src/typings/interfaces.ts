import { Snowflake } from 'discord.js';
import { Authority, Module } from '.';

export interface CommandData {
	command: string;
	timestamp: number;
}

export interface InventoryItem {
	name: string;
	amount: number;
	lastGenerateAt: number | null;
	collected: boolean | null;
}

export interface EconomyInfo {
	wallet: number;
	treasury: number;
	total: number;
	rank: number;
}

export interface IncomeCommandProperties {
	command: string;
	min: number;
	max: number;
	chance: number;
	minFine: number;
	maxFine: number;
}

export interface RoleAuthority {
	roleId: string;
	authority: Authority;
}

export interface Command {
	min?: number;
	max?: number;
	chance?: number;
	minfine?: number;
	maxfine?: number;
	cooldown: number;
}

export interface ModuleOwnership {
	guildId: Snowflake;
	modules: Module[];
}
