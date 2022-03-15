import { ColorResolvable } from 'discord.js';

import { ReplyString, DefaultIncomes, DefaultIntervals } from './index.js';

export const defaultIntervalsObj: DefaultIntervals = {
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

export const defaultIncomesObj: DefaultIncomes = {
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

export enum Authorities {
	USER = 'user',
	MODERATOR = 'moderator',
	MANAGER = 'manager',
	ADMINISTRATOR = 'administrator',
	DEVELOPER = 'developer',
}

export type AuthorityString = keyof typeof Authorities;

export const EmbedColors: Record<ReplyString, ColorResolvable> = {
	success: 'GREEN',
	info: 'BLURPLE',
	warn: 'YELLOW',
	error: 'RED',
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
	ERROR = '<:appendix_info:843390419429883924>',
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
	GENERATOR = '<:generator:953122979544444928>',
}

export const BUTTON_INTERACTION_COOLDOWN = 1000 * 15;

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
	| 'CORPORATION';
export type ModuleString = DefaultModuleString | SpecialModuleString;
export const Modules: Record<ModuleString, ModuleTypeString> = {
	ADMIN: 'DEFAULT',
	ECONOMY: 'DEFAULT',
	INCOME: 'DEFAULT',
	MODERATION: 'DEFAULT',
	SHOP: 'DEFAULT',
	UTILITY: 'DEFAULT',
	INSIGHTS: 'SPECIAL',
	INTERVAL: 'SPECIAL',
	CORPORATION: 'SPECIAL',
};
