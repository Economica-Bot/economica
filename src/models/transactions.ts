import * as mongoose from 'mongoose';
import { ReqNum, ReqString, ReqDate, TransactionType, TransactionTypes } from '../structures/index';

interface Transaction {
	guildID: string;
	userID: string;
	transactionType: TransactionTypes;
	memo: string;
	wallet: number;
	treasury: number;
	total: number;
	date: Date;
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
		date: ReqDate,
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const TransactionModel: mongoose.Model<Transaction> = mongoose.model('Transactions', Schema);
