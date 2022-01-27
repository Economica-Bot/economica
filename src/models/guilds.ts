import * as mongoose from 'mongoose';

import { ReqRoleAuthorityArr, ReqString, RoleAuthority } from '../structures';

export interface GuildAuthData {
	mod: string[];
	manager: string[];
	admin: string[];
}

export interface Guild {
	guildId: string;
	currency: string;
	transactionLogChannel: string;
	infractionLogChannel: string;
	auth: Array<RoleAuthority>;
}

const Schema = new mongoose.Schema<Guild>(
	{
		guildId: ReqString,
		currency: ReqString,
		transactionLogChannel: ReqString,
		infractionLogChannel: ReqString,
		auth: ReqRoleAuthorityArr,
	},
	{
		strict: true,
		versionKey: false,
	}
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model('Guilds', Schema);
