import * as mongoose from 'mongoose';

import { defaultIncomes, defaultModules } from '../config';
import { Module, RoleAuthority } from '../typings';

export interface Guild {
	guildId: string;
	currency: string;
	transactionLogChannelId: string;
	infractionLogChannelId: string;
	botLogChannelId: string;
	auth: Array<RoleAuthority>;
	incomes: typeof defaultIncomes;
	modules: typeof defaultModules;
}

const Schema = new mongoose.Schema<Guild>(
	{
		guildId: { type: String, required: true },
		currency: { type: String, required: true },
		transactionLogChannelId: { type: String, required: true },
		infractionLogChannelId: { type: String, required: true },
		botLogChannelId: { type: String, required: true },
		auth: { type: Array<RoleAuthority>(), required: true },
		incomes: { type: Object, required: true, default: defaultIncomes },
		modules: { type: Array<Module>(), required: true, default: defaultModules },
	},
	{ strict: true, versionKey: false }
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model('Guilds', Schema);
