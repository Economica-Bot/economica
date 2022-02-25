import { EmbedAuthorData, MessageEmbed } from 'discord.js';

import { Authorities } from './constants.js';

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
	authority: keyof typeof Authorities;
}

export interface ConfirmModalEmbeds {
	promptEmbed: MessageEmbed;
	confirmEmbed: MessageEmbed;
	cancelEmbed: MessageEmbed;
}

export interface IncomeCommand {
	min?: number;
	max?: number;
	chance?: number;
	minfine?: number;
	maxfine?: number;
	cooldown: number;
}

export type defaultIncomes = {
	work: IncomeCommand;
	beg: IncomeCommand;
	crime: IncomeCommand;
	rob: IncomeCommand;
};

export interface IntervalCommand {
	amount: number;
	cooldown: number;
}

export type defaultIntervals = {
	minutely: IntervalCommand;
	hourly: IntervalCommand;
	daily: IntervalCommand;
	weekly: IntervalCommand;
	fortnightly: IntervalCommand;
	monthly: IntervalCommand;
};

export type ReplyString = 'success' | 'info' | 'warn' | 'error';
export type Author = 'bot' | 'user' | 'guild' | EmbedAuthorData;
export type Moderation = 'ban' | 'kick' | 'timeout' | 'unban' | 'untimeout';
export type BalanceString = 'wallet' | 'treasury';
export type ListingString = 'CLASSIC' | 'INSTANT' | 'USABLE' | 'UNUSABLE' | 'GENERATOR';
export type InfractionString = 'BAN' | 'KICK' | 'TIMEOUT' | 'UNBAN' | 'UNTIMEOUT';
export type TransactionString =
	| 'DEPOSIT'
	| 'WITHDRAW'
	| 'GIVE_PAYMENT'
	| 'RECEIVE_PAYMENT'
	| 'BUY'
	| 'SELL'
	| 'GENERATOR'
	| 'INCOME'
	| 'ADD_MONEY'
	| 'SET_MONEY'
	| 'LOAN_PROPOSE'
	| 'LOAN_CANCEL'
	| 'LOAN_ACCEPT'
	| 'LOAN_DECLINE'
	| 'LOAN_DELETE'
	| 'LOAN_GIVE_REPAYMENT'
	| 'LOAN_RECEIVE_REPAYMENT'
	| 'WORK'
	| 'BEG'
	| 'CRIME_SUCCESS'
	| 'CRIME_FINE'
	| 'ROB_SUCCESS'
	| 'ROB_VICTIM'
	| 'ROB_FINE'
	| 'INTERVAL_MINUTE'
	| 'INTERVAL_HOUR'
	| 'INTERVAL_DAY'
	| 'INTERVAL_WEEK'
	| 'INTERVAL_FORTNIGHT'
	| 'INTERVAL_MONTH';
export const OccupationArr = [
	'Accountant',
	'Business Analyst',
	'CEO',
	'CFO',
	'COO',
	'CTO',
	'Laborer',
	'Manager',
	'Marketer',
	'Secretary',
	'Talent Acquisitor',
	'Head of Diversity',
	'Dog Walker',
] as const;
export type OccupationString = typeof OccupationArr[number];

export * from './constants.js';
