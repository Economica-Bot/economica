import * as mongoose from 'mongoose';
import { ReqNum, ReqString, TransactionType } from '../structures/Datatypes';
import { TransactionTypes } from '../structures/TransactionTypes';

interface Transaction {
	guildID: string;
	userID: string;
	transactionType: TransactionTypes;
	memo: string;
	wallet: number;
	treasury: number;
	total: number;
}

const Schema = new mongoose.Schema<Transaction>(
	{
		guildID: ReqString,
		userID: ReqString,
		transaction_type: TransactionType,
		memo: ReqString,
		wallet: ReqNum,
		treasury: ReqNum,
		total: ReqNum,
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const TransactionModel: mongoose.Model<Transaction> = mongoose.model(
	'Transactions',
	Schema
);
