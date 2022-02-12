import { Snowflake } from 'discord.js';

import { Authority } from '.';
import { Module } from '../config';

export interface CommandData {
	command: string;
	timestamp: number;
}

export interface InventoryItem {
	refId: string;
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

export interface IncomeCommand {
	min?: number;
	max?: number;
	chance?: number;
	minfine?: number;
	maxfine?: number;
	cooldown: number;
}

export interface IntervalCommand {
	amount: number;
	cooldown: number;
}

export interface UserModule {
	guildId: Snowflake;
	module: Module;
}

export interface GuildModule {
	userId: Snowflake;
	module: Module;
}
