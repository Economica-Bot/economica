import * as mongoose from 'mongoose';

import { CommandData, InventoryItem } from '../typings';

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
		guildId: { type: String, required: true },
		userId: { type: String, required: true },
		wallet: { type: Number, required: true },
		treasury: { type: Number, required: true },
		total: { type: Number, required: true },
		commands: { type: Array<CommandData>(), required: true },
		inventory: { type: Array<InventoryItem>(), required: true },
	},
	{
		versionKey: false,
	}
);

export const MemberModel: mongoose.Model<Member> = mongoose.model('Members', Schema);
