import { EmbedFooterData, EmbedBuilder, Snowflake } from 'discord.js';

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
export interface ConfirmModalEmbeds {
	promptEmbed: EmbedBuilder;
	confirmEmbed: EmbedBuilder;
	cancelEmbed: EmbedBuilder;
}
export interface IncomeCommand {
	min?: number;
	max?: number;
	chance?: number;
	minfine?: number;
	maxfine?: number;
	cooldown: number;
}
export type Incomes = {
	work: IncomeCommand;
	beg: IncomeCommand;
	crime: IncomeCommand;
	rob: IncomeCommand;
};
export interface IntervalCommand {
	amount: number;
	cooldown: number;
	enabled: boolean;
}
export type Intervals = {
	minutely: IntervalCommand;
	hourly: IntervalCommand;
	daily: IntervalCommand;
	weekly: IntervalCommand;
	fortnightly: IntervalCommand;
	monthly: IntervalCommand;
};
export interface Module {
	type: ModuleTypeString;
	enabled: boolean;
	user: Snowflake | null;
}
export type ReplyString = 'success' | 'info' | 'warn' | 'error';
export type Footer = 'bot' | 'user' | 'guild' | EmbedFooterData;
export type Moderation = 'ban' | 'kick' | 'timeout' | 'unban' | 'untimeout';
export type BalanceString = 'wallet' | 'treasury';
export type ListingString = 'COLLECTABLE' | 'INSTANT' | 'USABLE' | 'GENERATOR';
export const ListingDescriptions: Record<ListingString, string> = {
	COLLECTABLE: 'Collectable items are just that; collectable. They exist in the inventory forever (unless sold or given away) and have no particular quirks or abilities, besides looking cool.',
	INSTANT: 'Instant items are special items that are used instantly when purchased.',
	USABLE: 'Usable items may be used after purchasing to the owner\'s discretion - when used, they may grant a role or special effect.',
	GENERATOR: 'Generator items generate money that can be collected with `/collect` based on a duration specific to that particular generator.',
};
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
	| 'INTERVAL_MONTH'
	| 'DICE_ROLL'
	| 'ROULETTE'
	| 'BLACKJACK';
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
	'Dog Walker',
}
export type OccupationString = keyof typeof Occupations;
export type ModuleTypeString =
	| 'DEFAULT'
	| 'SPECIAL';
export type DefaultModuleString =
	| 'ADMIN'
	| 'ECONOMY'
	| 'INCOME'
	| 'MODERATION'
	| 'SHOP'
	| 'UTILITY';
export type SpecialModuleString =
	| 'INSIGHTS'
	| 'INTERVAL'
	| 'CASINO';
export type ModuleString = DefaultModuleString | SpecialModuleString;
export * from './constants';
