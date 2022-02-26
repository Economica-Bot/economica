import mongoose from 'mongoose';

import { Guild, Member } from './index.js';

export interface Loan extends mongoose.Document {
	guild: mongoose.PopulatedDoc<Guild>;
	borrower: mongoose.PopulatedDoc<Member>;
	lender: mongoose.PopulatedDoc<Member>;
	principal: number;
	repayment: number;
	expires: Date;
	pending: boolean;
	active: boolean;
	complete: boolean;
	createdAt: Date;
}

export const LoanSchema = new mongoose.Schema<Loan>(
	{
		guild: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild', required: true },
		borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
		lender: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
		principal: { type: mongoose.Schema.Types.Number, required: true },
		repayment: { type: mongoose.Schema.Types.Number, required: true },
		expires: { type: mongoose.Schema.Types.Date, required: true },
		pending: { type: mongoose.Schema.Types.Boolean, required: true },
		active: { type: mongoose.Schema.Types.Boolean, required: true },
		complete: { type: mongoose.Schema.Types.Boolean, required: true },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
		versionKey: false,
	},
);

export const LoanModel: mongoose.Model<Loan> = mongoose.model('Loan', LoanSchema, 'Loan');
