import * as mongoose from 'mongoose';
import {
	CommandData,
	InventoryItem,
	ReqCommandDataArr,
	ReqInventoryItemArr,
	ReqNum,
	ReqString,
} from '../structures/index';

interface Member {
	guildID: string;
	userID: string;
	wallet: number;
	treasury: number;
	total: number;
	commands: Array<CommandData>;
	inventory: Array<InventoryItem>;
}

const Schema = new mongoose.Schema<Member>(
	{
		guildID: ReqString,
		userID: ReqString,
		wallet: ReqNum,
		treasury: ReqNum,
		total: ReqNum,
		commands: ReqCommandDataArr,
		inventory: ReqInventoryItemArr,
	},
	{
		versionKey: false,
	}
);

export const MemberModel: mongoose.Model<Member> = mongoose.model('Members', Schema);
