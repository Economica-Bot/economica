import * as mongoose from 'mongoose';
import {
	ChannelSetting,
	CommandSetting,
	ModuleSetting,
	RoleSetting,
	ReqString,
} from '../structures/index';

export interface Guild {
	guildID: string;
	currency: string;
	transactionLogChannel: string;
	infractionLogChannel: string;
}

const Schema = new mongoose.Schema<Guild>(
	{
		guildID: ReqString,
		currency: ReqString,
		transactionLogChannel: ReqString,
		infractionLogChannel: ReqString,
	},
	{
		strict: true,
		versionKey: false,
	}
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model('Guilds', Schema);
