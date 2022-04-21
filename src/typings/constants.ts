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

export enum Authorities {
	USER,
	MODERATOR,
	MANAGER,
	ADMINISTRATOR,
	DEVELOPER,
}

export type AuthorityString = keyof typeof Authorities;
export const EmbedColors: Record<ReplyString, ColorResolvable> = {
	success: 'Green',
	info: 'Blurple',
	warn: 'Yellow',
	error: 'Red',
};
export enum Emojis {
	ECONOMICA_LOGO_0 = '<:economicalogo0:843375936589922305>',
	ECONOMICA_LOGO_1 = '<:economicalogo1:843376438782722068>',
	ECONOMICA_LOGO_2 = '<:economicalogo2:843376482603892746>1',
	ITEM_DISABLED = '<:ITEM_DISABLED:944737714274717746>',
	ACTIVE_LOAN = '<:active_loan:947238735668449280>',
	CREATE_LOAN = '<:create_loan:947238735471333427>',
	MANAGE_LOAN = '<:manage_loan:947238735450353734>',
	SELECT = '<:select:947240263003304027>',
	DESCRIPTION = '<:description:950268990763204648>',
	FORMAT = '<:format:950251489966837880>',
	RESEARCH = '<:research:950251348782350377>',
	DASHBOARD = '<:dashboard:950251162869841930>',
	COMMAND = '<:command:950269811039039540>',
	SUCCESS = '<:appendix_success:843390419261194300>',
	INFO = '<:appendix_info:843390419429883924>',
	WARNING = '<:appendix_warning:843390419270107136>',
	ERROR = '<:appendix_error:843390419303661569>',
	HELP = '<:help:950426939796111390>',
	ANALYTICS = '<:analytics:950870757616005150>',
	TEAM_MEMBER = '<:teammember:950871612289343558>',
	COMMUNITY = '<:community:950871622934491196>',
	ROBOT = '<:robot:950871596426461284>',
	MEMORY = '<:memory:950902208042532904>',
	INTERVAL = '⏱️',
	ADMIN = '<:admin:950999584858066964>',
	UTILITY = '<:utilities:950999584824492042>',
	INCOME = '<:salary:950999584769978468>',
	SHOP = '<:store:950999584698679367>',
	ECONOMY = '<:economy:950998596877176902>',
	MODERATION = '🛡️',
	INSIGHTS = '<:insights:950998596147359764>',
	CORPORATION = '<:corporation:950998596109619240>',
	STOCK = '<:stock:953112763591438336>',
	STACK = '<:stack:953113375716548638>',
	TREASURY = '🏦',
	WALLET = '<:wallet:953114661295886437>',
	SETTINGS = '<:settings:953115211584381008>',
	SEARCH = '<:search:953117655970242620>',
	CANCEL = '✖',
	PUBLISH = '✔',
	ADD = '➕', // ➕
	GENERATOR = '<:generator:953122979544444928>',
	ROULETTE = '<:roulette:955308143540314123>',
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
type RouletteBetsNamesType =
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
type RouletteBetsFormattedType =
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
type RouletteBetsDescriptionsType =
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
