import * as mongoose from 'mongoose';

import { CommandData, InventoryItem, ReqCommandDataArr, ReqInventoryItemArr, ReqNum, ReqString } from '../structures';

interface Member {
	guildId: string;
	userId: string;
	wallet: number;
	treasury: number;
	total: number;
	commands: Array<CommandData>;
	inventory: Array<InventoryItem>;
}

const Schema = new mongoose.Schema<Member>(
	{
		guildId: ReqString,
		userId: ReqString,
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
