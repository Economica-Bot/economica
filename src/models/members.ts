import * as mongoose from 'mongoose';

import { Command, CommandSchema, Guild, Infraction, InventoryItem, InventoryItemSchema } from '.';

export interface Member extends mongoose.Document {
	guild: mongoose.PopulatedDoc<Guild>;
	userId: string;
	wallet: number;
	treasury: number;
	commands: mongoose.Types.DocumentArray<Command>;
	infractions: mongoose.Types.DocumentArray<Infraction>;
	inventory: mongoose.Types.DocumentArray<InventoryItem>;
}

export const MemberSchema = new mongoose.Schema<Member>(
	{
		guild: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
		userId: { type: mongoose.Schema.Types.String, required: true },
		wallet: { type: mongoose.Schema.Types.Number, default: 0 },
		treasury: { type: mongoose.Schema.Types.Number, default: 0 },
		commands: { type: [CommandSchema], default: [] },
		inventory: { type: [InventoryItemSchema], default: [] },
	},
	{
		versionKey: false,
	}
);

export const MemberModel: mongoose.Model<Member> = mongoose.model('Member', MemberSchema);
