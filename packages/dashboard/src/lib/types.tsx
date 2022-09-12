import { Snowflake } from 'discord-api-types/globals';
import { APIGuild } from 'discord-api-types/v10';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<T = unknown> = NextPage<T> & {
	getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout<T> = AppProps & {
	Component: NextPageWithLayout<T>;
};

export type User = {
	id: string;
	bot: boolean;
	system: boolean;
	flags: number;
	username: string;
	discriminator: string;
	avatar: string;
	banner: string | null;
	accentColor: string | null;
	createdTimestamp: number;
	defaultAvatarURL: string;
	jexAccentColor: string | null;
	tag: string;
	avatarURL: string;
	displayAvatarURL: string;
	bannerURL: string;
};

export type Member = {
	userId: string;
	guildId: string;
	user: User;
	guild: Guild;
	treasury: number;
	wallet: number;
};

export type Infraction = {
	id: Snowflake;
	guild: Guild;
	target: Member;
	agent: Member;
	type: string;
	reason: string;
	active: boolean | null;
	duration: number | null;
	permanent: boolean | null;
	createdAt: Date;
};

export type Guild = APIGuild & {
	id: string;
	currency: string;
	transactionLogId: string | undefined;
	infractionLogId: string | undefined;
	incomes: typeof defaultIncomesObj;
	intervals: typeof defaultIntervalsObj;
	modules: typeof defaultModulesObj;
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
export type ModuleTypeString = 'DEFAULT' | 'SPECIAL';
export type DefaultModuleString =
	| 'ADMIN'
	| 'ECONOMY'
	| 'INCOME'
	| 'MODERATION'
	| 'SHOP'
	| 'UTILITY';
export type SpecialModuleString = 'INSIGHTS' | 'INTERVAL' | 'CASINO';
export type ModuleString = DefaultModuleString | SpecialModuleString;
export interface Module {
	type: ModuleTypeString;
	enabled: boolean;
	user: Snowflake | null;
}
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
