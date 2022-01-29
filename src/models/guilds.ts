import * as mongoose from 'mongoose';

import { RoleAuthority } from '../typings';

export interface Guild {
	guildId: string;
	currency: string;
	transactionLogChannel: string;
	infractionLogChannel: string;
	auth: Array<RoleAuthority>;
}

const Schema = new mongoose.Schema<Guild>(
	{
		guildId: { type: String, required: true },
		currency: { type: String, required: true },
		transactionLogChannel: { type: String, required: true },
		infractionLogChannel: { type: String, required: true },
		auth: { type: Array<RoleAuthority>(), required: true },
	},
	{
		strict: true,
		versionKey: false,
	}
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model('Guilds', Schema);
