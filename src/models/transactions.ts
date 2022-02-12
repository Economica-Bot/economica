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
		guildId: { type: mongoose.Schema.Types.String, required: true },
		userId: { type: mongoose.Schema.Types.String, required: true },
		agentId: { type: mongoose.Schema.Types.String, required: true },
		type: { type: mongoose.Schema.Types.String, required: true },
		wallet: { type: mongoose.Schema.Types.Number, required: true },
		treasury: { type: mongoose.Schema.Types.Number, required: true },
		total: { type: mongoose.Schema.Types.Number, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const TransactionModel: mongoose.Model<Transaction> = mongoose.model('Transactions', Schema);
