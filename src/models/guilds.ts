import * as mongoose from 'mongoose';
import { ReqString } from '../structures/Datatypes';
import {
	ChannelSetting,
	CommandSetting,
	ModuleSetting,
	RoleSetting,
} from '../structures/Settings';

interface Guild {
	guildID: string;
	modules: Array<ModuleSetting>;
	channels: Array<ChannelSetting>;
	roles: Array<RoleSetting>;
	commands: Array<CommandSetting>;
	currency: string;
	transactionLogChannel: string;
	infractionLogChannel: string;
}

const Schema = new mongoose.Schema<Guild>(
	{
		guildID: ReqString,
		modules: [],
		commands: [],
		incomecommands: [],
		currency: {
			type: String,
			required: false,
			default: '💵',
		},
		transactionLogChannel: ReqString,
		infractionLogChannel: ReqString,
	},
	{
		versionKey: false,
	}
);

export const GuildModel: mongoose.Model<Guild> = mongoose.model(
	'Guilds',
	Schema
);
