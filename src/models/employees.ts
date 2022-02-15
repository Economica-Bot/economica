import * as mongoose from 'mongoose';

import { Contract, ContractSchema, Member } from '.';

export interface Employee extends mongoose.Types.Subdocument {
	member: mongoose.PopulatedDoc<Member>;
	contract: mongoose.Types.DocumentArray<Contract>;
	active: boolean;
	createdAt: Date;
}

export const EmployeeSchema = new mongoose.Schema<Employee>(
	{
		member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
		contract: { type: [ContractSchema], default: [] },
		experience: { type: mongoose.Schema.Types.ObjectId, default: 0 },
		active: { type: mongoose.Schema.Types.Boolean, default: false },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const EmployeeModel: mongoose.Model<Employee> = mongoose.model('Employee', EmployeeSchema);
