import { ColorResolvable } from 'discord.js';

import { ReplyString, Incomes, Intervals, Module, ModuleString } from './index.js';

export const defaultIntervalsObj: Intervals = {
	minutely: {
		amount: 50,
		cooldown: 1000 * 60,
		enabled: true,
	},
	hourly: {
		amount: 500,
		cooldown: 1000 * 60 * 60,
		enabled: true,
	},
	daily: {
		amount: 5_000,
		cooldown: 1000 * 60 * 60 * 24,
		enabled: true,
	},
	weekly: {
		amount: 50_000,
		cooldown: 1000 * 60 * 60 * 24 * 7,
		enabled: true,
	},
	fortnightly: {
		amount: 125_000,
		cooldown: 1000 * 60 * 60 * 24 * 7 * 2,
		enabled: true,
	},
	monthly: {
		amount: 300_000,
		cooldown: 1000 * 60 * 60 * 24 * 7 * 4,
		enabled: true,
	},
};

export const defaultIncomesObj: Incomes = {
	work: {
		min: 100,
		max: 500,
		cooldown: 1000 * 30,
	},
	beg: {
		min: 25,
		max: 125,
		chance: 40,
		cooldown: 1000 * 30,
	},
	crime: {
		min: 300,
		max: 1500,
		chance: 60,
		minfine: 300,
		maxfine: 1500,
		cooldown: 1000 * 60,
	},
	rob: {
		chance: 20,
		minfine: 500,
		maxfine: 2000,
		cooldown: 1000 * 60,
	},
};

export const defaultModulesObj: Record<ModuleString, Module> = {
	ADMIN: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
	CASINO: {
		type: 'SPECIAL',
		enabled: false,
		user: null,
	},
	ECONOMY: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
	INCOME: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
	INSIGHTS: {
		type: 'SPECIAL',
		enabled: false,
		user: null,
	},
	INTERVAL: {
		type: 'SPECIAL',
		enabled: false,
		user: null,
	},
	MODERATION: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
	SHOP: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
	UTILITY: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
};

export const EmbedColors: Record<ReplyString, ColorResolvable> = {
	success: 'Green',
	info: 'Blurple',
	warn: 'Yellow',
	error: 'Red',
};
export enum Emojis {
	ADMIN = '<:admin:963849715600990318>',
	ANALYTICS = '<:analytics:963849715621961768>',
	ANALYZE = '<:analyze:963849715672317962>',
	BOT = '<:bot:963849715626160208>',
	CHART = '<:chart:963849715617787964>',
	CHECK = '<:check:963849715689082950>',
	CHEQUE = '<:cheque:963849715676479549>',
	CODE = '<:code:963849715718430791>',
	COMMAND = '<:command:963849715751989258>',
	COMMUNE = '<:commune:963849715743612948>',
	COMMUNITY = '<:community:963849715856846848>',
	CORPORATION = '<:corporation:963849715819106394>',
	CROSS = '<:cross:963849715437424732>',
	DASHBOARD = '<:dashboard:963849715936550962>',
	DESCRIPTION = '<:description:963849715873615892>',
	DISABLE = '<:disable:963849715412246600>',
	E_ALPHA = '<:e_alpha:963849777261465620>',
	E_OG = '<:e_og:963849777974509648>',
	ECONOMICA = '<:economica:963849777928355880>',
	ENABLE = '<:enable:963849715873615922>',
	ESCROW = '<:escrow:963875587598974986>',
	FIRE = '🔥',
	FUNDS = '<:funds:963849716033028096>',
	GENERATOR = '<:generator:963849715932356688>',
	GIVE = '<:give:973075836704014446>',
	HELP = '<:help:963849715940728842>',
	INFO = '<:info:963849715970105354>',
	INSUFFICIENT = '<:insufficient:963849715882000494>',
	INTERVAL = '🕒',
	KEY = '🔑',
	LOAN = '<:loan:963849715932344340>',
	MANAGE = '<:manage:963849716221763634>',
	MEMORY = '<:memory:963849715978485890>',
	PLUS = '<:plus:963849715923968120>',
	REMOVE = '<:remove:973076110650789888>',
	ROCK = '🪨',
	ROLE = '<:role:973075468951646288>',
	ROULETTE = '<:roulette:963849716100124752>',
	SEARCH = '<:search:963849716020420709>',
	SELECT = '<:select:963849716230127636>',
	SETTING = '<:settings:963849715949125712>',
	SHOP = '<:shop:963849715965919252>',
	SPEC = '<:spec:963849715923959880>',
	STACK = '<:stack:963849716012048465>',
	STOCK = '<:stock:963849715680702496>',
	TREASURY = '🏦',
	WALLET = '<:wallet:963849716003639397>',
	WARNING = '<:warning:963849716083343431>',
}
export const INTERACTION_COMPONENT_COOLDOWN = 1000 * 45;
export enum Properties {
	TEXTILE_MILL = 'MANUFACTURING',
	OIL_REFINERY = 'MANUFACTURING',
	PLASTIC_FACTORY = 'MANUFACTURING',
	LUMBER_PLANT = 'MANUFACTURING',
	SUPERMARKET = 'RETAIL',
	WAREHOUSE_STORE = 'RETAIL',
	MALL = 'RETAIL',
	ORCHARD = 'AGRICULTURE',
	HYDROPONIC_FARM = 'AGRICULTURE',
	TRADITIONAL_FARM = 'AGRICULTURE',
	LIVESTOCK = 'AGRICULTURE',
	BULLDOZER = 'CONSTRUCTION',
	FRONT_LOADER = 'CONSTRUCTION',
	DUMP_TRUCK = 'CONSTRUCTION',
	BACKHOE = 'CONSTRUCTION',
	TRENCHER = 'CONSTRUCTION',
	CRANE = 'CONSTRUCTION',
	PRESCHOOL = 'EDUCATION',
	KINDERGARTEN = 'EDUCATION',
	ELEMENTARY_SCHOOL = 'EDUCATION',
	INTERMEDIATE_SCHOOL = 'EDUCATION',
	SECONDARY_SCHOOL = 'EDUCATION',
	COLLEGE = 'EDUCATION',
	UNIVERSITY = 'EDUCATION',
	PHONE_ASSEMBLY_LINE = 'TECHNOLOGY',
	COMPUTER_ASSEMBLY_LINE = 'TECHNOLOGY',
	TABLET_ASSEMBLY_LINE = 'TECHNOLOGY',
	COMPACT_CAR = 'TRANSPORATION',
	BUS = 'TRANSPORATION',
	STEAM_LOCOMOTIVE = 'TRANSPORATION',
	DIESEL_LOCOMOTIVE = 'TRANSPORATION',
	ELECTRIC_LOCOMOTIVE = 'TRANSPORATION',
	CESSNA = 'TRANSPORATION',
	JUMBO_JET = 'TRANSPORATION',
}
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
export const RouletteBets: Record<RouletteBetsNamesType, RouletteBet> = {
	single: {
		type: 'Inside',
		formatted: 'Single',
		description: 'Bet on a single number',
	},
	split: {
		type: 'Inside',
		formatted: 'Split',
		description: 'Bet on two distinct vertically/horizontally adjacent numbers',
	},
	street: {
		type: 'Inside',
		formatted: 'Street',
		description: 'Bet on three distinct consecutive numbers in a horizontal line',
	},
	corner: {
		type: 'Inside',
		formatted: 'Corner',
		description: 'Bet on four numbers that meet at one corner',
	},
	double_street: {
		type: 'Inside',
		formatted: 'Double Street',
		description: 'Bet on six consecutive numbers that form two horizontal lines',
	},
	trio: {
		type: 'Inside',
		formatted: 'Trio',
		description: 'A three-number bet that involves at least one zero',
	},
	first_four: {
		type: 'Inside',
		formatted: 'First Four',
		description: 'Bet on 0-1-2-3',
	},
	half: {
		type: 'Outside',
		formatted: 'Half',
		description: 'A bet that the number will be in the chosen range',
	},
	color: {
		type: 'Outside',
		formatted: 'Color',
		description: 'A bet that the number will be the chosen color',
	},
	even_or_odd: {
		type: 'Outside',
		formatted: 'Even or Odd',
		description: 'A bet that the number will be of the chosen type',
	},
	dozen: {
		type: 'Outside',
		formatted: 'Dozen',
		description: 'A bet that the number will be in the chosen dozen',
	},
	column: {
		type: 'Outside',
		formatted: 'Column',
		description: 'A bet that the number will be in the chosen vertical column',
	},
	snake: {
		type: 'Outside',
		formatted: 'Snake',
		description: 'A special bet that covers the numbers 1, 5, 9, 12, 13, 16, 19, 23, 27, 30, 32, and 34',
	},
};
