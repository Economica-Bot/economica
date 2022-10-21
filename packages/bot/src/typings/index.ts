import { EmbedFooterData } from '@discordjs/builders';
import { Snowflake } from 'discord-api-types/v10';
import { Economica } from '../structures';

export interface IncomeCommand {
	min: number | null;
	max: number | null;
	chance: number | null;
	minfine: number | null;
	maxfine: number | null;
	cooldown: number | null;
}
export const IncomeArr = ['work', 'beg', 'crime', 'rob'] as const;
export type IncomeString = typeof IncomeArr[number];
export interface IntervalCommand {
	amount: number;
	cooldown: number;
	enabled: boolean;
}
export const IntervalArr = [
	'minutely',
	'hourly',
	'daily',
	'weekly',
	'fortnightly',
	'monthly'
] as const;
export type IntervalString = typeof IntervalArr[number];
export interface ModuleObj {
	type: ModuleTypeString;
	enabled: boolean;
	user: Snowflake | null;
}
export type ReplyString = 'success' | 'info' | 'warn' | 'error';
export type Footer = 'user' | 'guild' | EmbedFooterData;
export type Moderation = 'ban' | 'kick' | 'timeout' | 'unban' | 'untimeout';
export type BalanceString = 'wallet' | 'treasury';
export enum ListingType {
	'COLLECTABLE',
	'INSTANT',
	'USABLE',
	'GENERATOR'
}
export const ListingDescriptions: Record<keyof typeof ListingType, string> = {
	COLLECTABLE:
		'Collectable items are just that; collectable. They exist in the inventory forever (unless sold or given away) and have no particular quirks or abilities, besides looking cool.',
	INSTANT:
		'Instant items are special items that are used instantly when purchased.',
	USABLE:
		"Usable items may be used after purchasing to the owner's discretion - when used, they may grant a role or special effect.",
	GENERATOR:
		'Generator items generate money that can be collected with `/collect` based on a duration specific to that particular generator.'
};
export const InfractionStringArr = [
	'BAN',
	'KICK',
	'TIMEOUT',
	'UNBAN',
	'UNTIMEOUT'
] as const;
export type InfractionString = typeof InfractionStringArr[number];
export const TransactionStringArr = [
	'DEPOSIT',
	'WITHDRAW',
	'GIVE_PAYMENT',
	'RECEIVE_PAYMENT',
	'BUY',
	'SELL',
	'GENERATOR',
	'INCOME',
	'ADD_MONEY',
	'SET_MONEY',
	'LOAN_PROPOSE',
	'LOAN_CANCEL',
	'LOAN_ACCEPT',
	'LOAN_DECLINE',
	'LOAN_DELETE',
	'LOAN_GIVE_REPAYMENT',
	'LOAN_RECEIVE_REPAYMENT',
	'WORK',
	'BEG',
	'CRIME_SUCCESS',
	'CRIME_FINE',
	'ROB_SUCCESS',
	'ROB_VICTIM',
	'ROB_FINE',
	'INTERVAL_MINUTE',
	'INTERVAL_HOUR',
	'INTERVAL_DAY',
	'INTERVAL_WEEK',
	'INTERVAL_FORTNIGHT',
	'INTERVAL_MONTH',
	'DICE_ROLL',
	'ROULETTE',
	'BLACKJACK'
] as const;
export type TransactionString = typeof TransactionStringArr[number];
export enum Occupations {
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
	'Dog Walker'
}
export type OccupationString = keyof typeof Occupations;
export const ModuleTypeStringArr = ['DEFAULT', 'SPECIAL'] as const;
export type ModuleTypeString = typeof ModuleTypeStringArr[number];
export const DefaultModuleStringArr = [
	'ECONOMY',
	'INCOME',
	'MODERATION',
	'SHOP',
	'UTILITY'
] as const;
export type DefaultModuleString = typeof DefaultModuleStringArr[number];
export const SpecialModuleStringArr = ['INSIGHTS', 'INTERVAL'] as const;
export type SpecialModuleString = typeof SpecialModuleStringArr[number];
export const ModuleStringArr = [
	...DefaultModuleStringArr,
	...SpecialModuleStringArr
] as const;
export type ModuleString = typeof ModuleStringArr[number];
export interface Job {
	name: string;
	cooldown: number;
	execution: (client: Economica) => Promise<void>;
}
export interface Service {
	service: string;
	cooldown: number;
	execute: (client: Economica) => Promise<void>;
}

export * from './constants';
