import mongoose from 'mongoose';

import { Contract, ContractSchema, Member } from './index.js';

export interface Employee extends mongoose.Types.Subdocument {
	member: mongoose.PopulatedDoc<Member>;
	contract: mongoose.Types.Subdocument<Contract>;
	amount: number;
	active: boolean;
	createdAt: Date;
}

export const EmployeeSchema = new mongoose.Schema<Employee>(
	{
		member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
		contract: { type: ContractSchema },
		amount: { type: mongoose.Schema.Types.Number, default: 0 },
		active: { type: mongoose.Schema.Types.Boolean, default: false },
	},
	{ timestamps: true, versionKey: false },
);

export const EmployeeModel: mongoose.Model<Employee> = mongoose.model('Employee', EmployeeSchema);
