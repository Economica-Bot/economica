import * as mongoose from 'mongoose';

import { CURRENCY_SYMBOL, defaultIncomes, Module } from '../config';
import { RoleAuthority } from '../typings';
import { IncomeCommand } from '../typings/interfaces';

export const defaultModulesArr: Module[] = [
	'ADMIN',
	'APPLICATION',
	'ECONOMY',
	'INCOME',
	'MODERATION',
	'SHOP',
	'STATISTICS',
	'UTILITY',
];

export const modulesArr: Module[] = [
	'ADMIN',
	'APPLICATION',
	'ECONOMY',
	'INCOME',
	'MODERATION',
	'SHOP',
	'UTILITY',
	'TESTMODULE',
];

const defaultIncomesObj: defaultIncomes = {
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

export interface Guild {
	guildId: string;
	currency: string;
	transactionLogChannelId: string;
	infractionLogChannelId: string;
	botLogChannelId: string;
	auth: RoleAuthority[];
	incomes: typeof defaultIncomesObj;
	modules: Module[];
}

const Schema = new mongoose.Schema<Guild>(
	{
		guildId: { type: String, required: true },
		currency: { type: String, default: CURRENCY_SYMBOL },
		transactionLogChannelId: { type: String, default: null },
		infractionLogChannelId: { type: String, default: null },
		botLogChannelId: { type: String, default: null },
		auth: { type: Array<RoleAuthority>(), default: [] },
		incomes: { type: Object, default: defaultIncomesObj },
		modules: { type: Array<Module>(), default: defaultModulesArr },
	},
	{ strict: true, versionKey: false }
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model('Guilds', Schema);
