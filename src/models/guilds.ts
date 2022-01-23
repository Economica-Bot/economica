import * as mongoose from 'mongoose';
import {
	ChannelSetting,
	CommandSetting,
	ModuleSetting,
	RoleSetting,
	ReqString,
	ReqStringArr,
	GuildAuthData,
	GuildAuthDataObj
} from '../structures/index';

export interface Guild {
	guildId: string;
	currency: string;
	transactionLogChannel: string;
	infractionLogChannel: string;
	auth: GuildAuthData;
}

const Schema = new mongoose.Schema<Guild>(
	{
		guildId: ReqString,
		currency: ReqString,
		transactionLogChannel: ReqString,
		infractionLogChannel: ReqString,
		auth: GuildAuthDataObj
	},
	{
		strict: true,
		versionKey: false,
	}
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model('Guilds', Schema);
