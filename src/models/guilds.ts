import * as mongoose from 'mongoose';
import { ReqString, RoleAuthority, ReqRoleAuthorityArr } from '../structures';

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
