import * as mongoose from 'mongoose';
import {
	ReqNum,
	ReqString,
	NonReqString,
	ReqDate,
	TransactionType,
	TransactionTypes,
} from '../structures/index';

interface Transaction {
	_id: mongoose.Types.ObjectId;
	guildId: string;
	userId: string;
	transactionType: TransactionTypes;
	memo: string;
	wallet: number;
	treasury: number;
	total: number;
	createdAt: Date;
}

const Schema = new mongoose.Schema<Transaction>(
	{
		guildId: ReqString,
		userId: ReqString,
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

export const TransactionModel: mongoose.Model<Transaction> = mongoose.model('Transactions', Schema);
