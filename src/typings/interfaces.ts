import { MessageEmbed } from 'discord.js';
import { Authority } from '.';

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

export interface ConfirmModalEmbeds {
	promptEmbed: MessageEmbed;
	confirmEmbed: MessageEmbed;
	cancelEmbed: MessageEmbed;
}
