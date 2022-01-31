import * as mongoose from 'mongoose';

import { TransactionString } from '../typings';

export interface Transaction {
	_id: mongoose.Types.ObjectId;
	guildId: string;
	userId: string;
	agentId: string;
	type: TransactionString;
	wallet: number;
	treasury: number;
	total: number;
	createdAt: Date;
}

const Schema = new mongoose.Schema<Transaction>(
	{
		guildId: { type: String, required: true },
		userId: { type: String, required: true },
		agentId: { type: String, required: true },
		type: { type: String, required: true },
		wallet: { type: Number, required: true },
		treasury: { type: Number, required: true },
		total: { type: Number, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const TransactionModel: mongoose.Model<Transaction> = mongoose.model('Transactions', Schema);
