import mongoose from 'mongoose';

import { CURRENCY_SYMBOL } from '../config.js';
import { RoleAuthority, defaultIncomesObj, defaultIntervalsObj, defaultModulesArr, modulesArr } from '../typings/index.js';

export interface Guild extends mongoose.Document {
	guildId: string;
	currency: string;
	transactionLogId: string;
	infractionLogId: string;
	botLogId: string;
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
		transactionLogId: { type: mongoose.Schema.Types.String, default: null },
		infractionLogId: { type: mongoose.Schema.Types.String, default: null },
		botLogId: { type: mongoose.Schema.Types.String, default: null },
		sellRefund: { type: mongoose.Schema.Types.Number, default: 0.5 },
		auth: { type: mongoose.Schema.Types.Array, default: [] },
		incomes: { type: Object, default: defaultIncomesObj },
		intervals: { type: Object, default: defaultIntervalsObj },
		modules: { type: mongoose.Schema.Types.Array, default: defaultModulesArr },
	},
	{
		strict: true,
		versionKey: false,
	},
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model('Guild', GuildSchema);
