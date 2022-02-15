import * as mongoose from 'mongoose';

import { Guild, Member } from '.';
import { TransactionString } from '../typings';

export interface Transaction extends mongoose.Document {
	guild: mongoose.PopulatedDoc<Guild>;
	target: mongoose.PopulatedDoc<Member>;
	agent: mongoose.PopulatedDoc<Member>;
	type: TransactionString;
	wallet: number;
	treasury: number;
	createdAt: Date;
}

export const TransactionSchema = new mongoose.Schema<Transaction>(
	{
		guild: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
		target: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
		agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
		type: { type: mongoose.Schema.Types.String, required: true },
		wallet: { type: mongoose.Schema.Types.Number, required: true },
		treasury: { type: mongoose.Schema.Types.Number, required: true },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
		versionKey: false,
	}
);

export const TransactionModel: mongoose.Model<Transaction> = mongoose.model('Transaction', TransactionSchema);
