import * as mongoose from 'mongoose';

export interface Loan {
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
		guildId: { type: String, required: true },
		borrowerId: { type: String, required: true },
		lenderId: { type: String, required: true },
		principal: { type: Number, required: true },
		repayment: { type: Number, required: true },
		expires: { type: Date, required: true },
		pending: { type: Boolean, required: true },
		active: { type: Boolean, required: true },
		complete: { type: Boolean, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const LoanModel: mongoose.Model<Loan> = mongoose.model('Loans', Schema);
