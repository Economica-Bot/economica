import { Snowflake } from 'discord-api-types/v10';
import {
	DefaultModuleStringArr,
	IncomeArr,
	InfractionStringArr,
	IntervalArr,
	ModuleStringArr,
	ModuleTypeStringArr,
	Occupations,
	Properties,
	SpecialModuleStringArr,
	TransactionStringArr
} from './constants';

export type PropertyString = `${Properties}`;
export type IndustryString = keyof typeof Properties;
export interface RouletteBet {
	type: 'Inside' | 'Outside';
	formatted: RouletteBetsFormattedType;
	description: RouletteBetsDescriptionsType;
}
export type RouletteBetsNamesType =
	| 'single'
	| 'split'
	| 'street'
	| 'corner'
	| 'double_street'
	| 'trio'
	| 'first_four'
	| 'half'
	| 'color'
	| 'even_or_odd'
	| 'dozen'
	| 'snake'
	| 'column';
export type RouletteBetsFormattedType =
	| 'Single'
	| 'Split'
	| 'Street'
	| 'Corner'
	| 'Double Street'
	| 'Trio'
	| 'First Four'
	| 'Half'
	| 'Color'
	| 'Even or Odd'
	| 'Dozen'
	| 'Column'
	| 'Snake';
export type RouletteBetsDescriptionsType =
	| 'Bet on a single number'
	| 'Bet on two distinct vertically/horizontally adjacent numbers'
	| 'Bet on three distinct consecutive numbers in a horizontal line'
	| 'Bet on four numbers that meet at one corner'
	| 'Bet on six consecutive numbers that form two horizontal lines'
	| 'A three-number bet that involves at least one zero'
	| 'Bet on 0-1-2-3'
	| 'A bet that the number will be in the chosen range'
	| 'A bet that the number will be the chosen color'
	| 'A bet that the number will be of the chosen type'
	| 'A bet that the number will be in the chosen dozen'
	| 'A bet that the number will be in the chosen vertical column'
	| 'A special bet that covers the numbers 1, 5, 9, 12, 13, 16, 19, 23, 27, 30, 32, and 34';
export interface IncomeCommand {
	min: number | null;
	max: number | null;
	chance: number | null;
	minfine: number | null;
	maxfine: number | null;
	cooldown: number | null;
}
export type IncomeString = typeof IncomeArr[number];
export interface IntervalCommand {
	amount: number;
	cooldown: number;
	enabled: boolean;
}
export type IntervalString = typeof IntervalArr[number];
export interface ModuleObj {
	type: ModuleTypeString;
	enabled: boolean;
	user: Snowflake | null;
}
export type ReplyString = 'success' | 'info' | 'warn' | 'error';
export type Moderation = 'ban' | 'kick' | 'timeout' | 'unban' | 'untimeout';
export type BalanceString = 'wallet' | 'treasury';
export type InfractionString = typeof InfractionStringArr[number];
export type TransactionString = typeof TransactionStringArr[number];
export type OccupationString = keyof typeof Occupations;
export type ModuleTypeString = typeof ModuleTypeStringArr[number];
export type DefaultModuleString = typeof DefaultModuleStringArr[number];
export type SpecialModuleString = typeof SpecialModuleStringArr[number];
export type ModuleString = typeof ModuleStringArr[number];
export interface Job {
	name: string;
	cooldown: number;
	execute: () => Awaited<void>;
}
export interface Service {
	service: string;
	cooldown: number;
	execute: () => Awaited<void>;
}
