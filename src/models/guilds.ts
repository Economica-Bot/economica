import * as mongoose from 'mongoose';

import {
	CURRENCY_SYMBOL,
	defaultIncomes,
	defaultIntervals,
	DefaultModuleString,
	ModuleString,
	SpecialModuleString,
} from '../config';
import { RoleAuthority } from '../typings';

export const defaultModulesArr: DefaultModuleString[] = ['ADMIN', 'ECONOMY', 'INCOME', 'MODERATION', 'SHOP', 'UTILITY'];
export const specialModulesArr: SpecialModuleString[] = ['INSIGHTS', 'INTERVAL', 'CORPORATION'];
export const modulesArr: ModuleString[] = [
	'ADMIN',
	'APPLICATION',
	'CORPORATION',
	'ECONOMY',
	'INCOME',
	'INSIGHTS',
	'INTERVAL',
	'MODERATION',
	'SHOP',
	'UTILITY',
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

const defaultIntervalsObj: defaultIntervals = {
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

export interface Guild extends mongoose.Document {
	guildId: string;
	currency: string;
	transactionLogChannelId: string;
	infractionLogChannelId: string;
	botLogChannelId: string;
	sellRefund: number;
	auth: RoleAuthority[];
	incomes: typeof defaultIncomesObj;
	intervals: typeof defaultIntervalsObj;
	modules: typeof modulesArr;
}

export const GuildSchema = new mongoose.Schema<Guild>(
	{
		guildId: { type: mongoose.Schema.Types.String, required: true },
		currency: { type: mongoose.Schema.Types.String, default: CURRENCY_SYMBOL },
		transactionLogChannelId: { type: mongoose.Schema.Types.String, default: null },
		infractionLogChannelId: { type: mongoose.Schema.Types.String, default: null },
		botLogChannelId: { type: mongoose.Schema.Types.String, default: null },
		sellRefund: { type: mongoose.Schema.Types.Number, default: 0.5 },
		auth: { type: mongoose.Schema.Types.Array, default: [] },
		incomes: { type: Object, default: defaultIncomesObj },
		intervals: { type: Object, default: defaultIntervalsObj },
		modules: { type: mongoose.Schema.Types.Array, default: defaultModulesArr },
	},
	{
		strict: true,
		versionKey: false,
	}
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model('Guild', GuildSchema);
