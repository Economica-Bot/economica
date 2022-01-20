import * as mongoose from 'mongoose';
import { ReqNum, ReqString, TransactionType, TransactionTypes } from '../structures/index';

interface Transaction {
	_id: mongoose.Types.ObjectId;
	guildId: string;
	userId: string;
	agentId: string;
	type: TransactionTypes;
	wallet: number;
	treasury: number;
	total: number;
	createdAt: Date;
}

const Schema = new mongoose.Schema<Transaction>(
	{
		guildId: ReqString,
		userId: ReqString,
		agentId: ReqString,
		type: TransactionType,
		wallet: ReqNum,
		treasury: ReqNum,
		total: ReqNum,
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const TransactionModel: mongoose.Model<Transaction> = mongoose.model('Transactions', Schema);
