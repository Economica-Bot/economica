import mongoose from 'mongoose';
import { Authority, AuthoritySchema } from './index.js';
import { CURRENCY_SYMBOL } from '../config';
import { defaultIncomesObj, defaultIntervalsObj, defaultModulesArr, modulesArr } from '../typings';

export interface Guild extends mongoose.Document {
	guildId: string;
	currency: string;
	transactionLogId: string;
	infractionLogId: string;
	botLogId: string;
	auth: mongoose.Types.DocumentArray<Authority>;
	incomes: typeof defaultIncomesObj;
	intervals: typeof defaultIntervalsObj;
	modules: typeof modulesArr;
}

export const GuildSchema = new mongoose.Schema<Guild>(
	{
		guildId: { type: mongoose.Schema.Types.String, required: true },
		currency: { type: mongoose.Schema.Types.String, default: CURRENCY_SYMBOL },
		transactionLogId: { type: mongoose.Schema.Types.String, default: null },
		infractionLogId: { type: mongoose.Schema.Types.String, default: null },
		botLogId: { type: mongoose.Schema.Types.String, default: null },
		auth: { type: [AuthoritySchema] },
		incomes: { type: Object, default: defaultIncomesObj },
		intervals: { type: Object, default: defaultIntervalsObj },
		modules: { type: [String], default: defaultModulesArr },
	},
	{ strict: true, versionKey: false },
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model('Guild', GuildSchema);
