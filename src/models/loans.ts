import * as mongoose from 'mongoose';
import { ReqBoolean, ReqDate, ReqNum, ReqString } from '../structures/index';

interface Loan {
	guildId: string;
	borrowerId: string;
	lenderId: string;
	principal: number;
	repayment: number;
	expires: Date;
	pending: boolean;
	active: boolean;
	complete: boolean;
	createdAt: Date;
}

const Schema = new mongoose.Schema<Loan>(
	{
		guildId: ReqString,
		borrowerId: ReqString,
		lenderId: ReqString,
		principal: ReqNum,
		repayment: ReqNum,
		expires: ReqDate,
		pending: ReqBoolean,
		active: ReqBoolean,
		complete: ReqBoolean,
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const LoanModel: mongoose.Model<Loan> = mongoose.model('Loans', Schema);
