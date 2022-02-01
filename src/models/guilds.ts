import * as mongoose from 'mongoose';

import { income } from '../config';
import { RoleAuthority } from '../typings';

export interface Guild {
	guildId: string;
	currency: string;
	transactionLogChannelId: string;
	infractionLogChannelId: string;
	botLogChannelId: string;
	auth: Array<RoleAuthority>;
	income: typeof income;
}

const Schema = new mongoose.Schema<Guild>(
	{
		guildId: { type: String, required: true },
		currency: { type: String, required: true },
		transactionLogChannelId: { type: String, required: true },
		infractionLogChannelId: { type: String, required: true },
		botLogChannelId: { type: String, required: true },
		auth: { type: Array<RoleAuthority>(), required: true },
		income: { type: Object, required: true, default: income },
	},
	{
		strict: true,
		versionKey: false,
	}
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model('Guilds', Schema);
