import * as mongoose from 'mongoose';
import { CURRENCY_SYMBOL } from '../config';
import { RoleAuthority, defaultIncomesObj, defaultIntervalsObj, defaultModulesArr, modulesArr } from '../typings';

export interface Guild extends mongoose.Document {
	guildId: string;
	currency: string;
	transactionLogChannelId: string;
	infractionLogChannelId: string;
	botLogChannelId: string;
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
		auth: { type: mongoose.Schema.Types.Array },
		incomes: { type: Object, default: defaultIncomesObj },
		intervals: { type: Object, default: defaultIntervalsObj },
		modules: { type: [String], default: defaultModulesArr },
	},
	{ strict: true, versionKey: false },
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model('Guild', GuildSchema);
