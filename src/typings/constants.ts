import { ColorResolvable } from 'discord.js';

import { ReplyString, defaultIncomes, defaultIntervals } from './index.js';

export const defaultIntervalsObj: defaultIntervals = {
	minutely: {
		amount: 50,
		cooldown: 1000 * 60,
	},
	hourly: {
		amount: 500,
		cooldown: 1000 * 60 * 60,
	},
	daily: {
		amount: 5_000,
		cooldown: 1000 * 60 * 60 * 24,
	},
	weekly: {
		amount: 50_000,
		cooldown: 1000 * 60 * 60 * 24 * 7,
	},
	fortnightly: {
		amount: 125_000,
		cooldown: 1000 * 60 * 60 * 24 * 7 * 2,
	},
	monthly: {
		amount: 300_000,
		cooldown: 1000 * 60 * 60 * 24 * 7 * 4,
	},
};

export const defaultIncomesObj: defaultIncomes = {
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

export const defaultModulesArr: (keyof typeof Modules)[] = ['ADMIN', 'ECONOMY', 'INCOME', 'MODERATION', 'SHOP', 'UTILITY'];
export const specialModulesArr: (keyof typeof Modules)[] = ['INSIGHTS', 'INTERVAL', 'CORPORATION', 'MESSAGE'];
export const modulesArr: (keyof typeof Modules)[] = [...defaultModulesArr, ...specialModulesArr];

export enum Authorities {
	USER = 'user',
	MODERATOR = 'moderator',
	MANAGER = 'manager',
	ADMINISTRATOR = 'administrator',
	DEVELOPER = 'developer',
}

export type AuthorityString = keyof typeof Authorities;

export enum SERVICE_COOLDOWNS {
	DEV = 1000 * 10,
	UPDATE_BANS = 1000 * 60 * 5,
	UPDATE_BOT_LOG = 1000 * 60 * 10,
	UPDATE_GENERATORS = 1000 * 60 * 5,
	UPDATE_LOANS = 1000 * 60 * 5,
	UPDATE_SHOP = 1000 * 60 * 5,
}

export const EmbedColors: Record<ReplyString, ColorResolvable> = {
	success: 'GREEN',
	info: 'BLURPLE',
	warn: 'YELLOW',
	error: 'RED',
};

export enum emojis {
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

export enum Modules {
	ADMIN = 'DEFAULT',
	ECONOMY = 'DEFAULT',
	INCOME = 'DEFAULT',
	MODERATION = 'DEFAULT',
	SHOP = 'DEFAULT',
	UTILITY = 'DEFAULT',
	INSIGHTS = 'SPECIAL',
	INTERVAL = 'SPECIAL',
	CORPORATION = 'SPECIAL',
	MESSAGE = 'SPECIAL',
	APPLICATION = 'DEV',
}

export type ModuleType = `${Modules}`;
export type ModuleString = keyof typeof Modules;
