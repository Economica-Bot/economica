import * as mongoose from 'mongoose';

import { CommandData, InventoryItem } from '../typings';

export interface Member {
	guildId: string;
	userId: string;
	wallet: number;
	treasury: number;
	total: number;
	commands: CommandData[];
	inventory: InventoryItem[];
}

const Schema = new mongoose.Schema<Member>(
	{
		guildId: { type: mongoose.Schema.Types.String, required: true },
		userId: { type: mongoose.Schema.Types.String, required: true },
		wallet: { type: mongoose.Schema.Types.Number, required: true },
		treasury: { type: mongoose.Schema.Types.Number, required: true },
		total: { type: mongoose.Schema.Types.Number, required: true },
		commands: { type: mongoose.Schema.Types.Array, required: true },
		inventory: { type: mongoose.Schema.Types.Array, required: true },
	},
	{
		versionKey: false,
	}
);

export const MemberModel: mongoose.Model<Member> = mongoose.model('Members', Schema);
