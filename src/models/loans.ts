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
		guildId: { type: mongoose.Schema.Types.String, required: true },
		borrowerId: { type: mongoose.Schema.Types.String, required: true },
		lenderId: { type: mongoose.Schema.Types.String, required: true },
		principal: { type: mongoose.Schema.Types.Number, required: true },
		repayment: { type: mongoose.Schema.Types.Number, required: true },
		expires: { type: mongoose.Schema.Types.Date, required: true },
		pending: { type: mongoose.Schema.Types.Boolean, required: true },
		active: { type: mongoose.Schema.Types.Boolean, required: true },
		complete: { type: mongoose.Schema.Types.Boolean, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const LoanModel: mongoose.Model<Loan> = mongoose.model('Loans', Schema);
