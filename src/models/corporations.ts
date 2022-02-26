import mongoose from 'mongoose';
import { IndustryString } from '../typings/index.js';

import { Application, ApplicationSchema, Employee, EmployeeSchema, Guild, Member, Property, PropertySchema } from './index.js';

export interface Corporation extends mongoose.Document {
	guild: mongoose.PopulatedDoc<Guild>;
	owner: mongoose.PopulatedDoc<Member>;
	name: string;
	industry: IndustryString;
	description: string;
	balance: number;
	applications: mongoose.Types.DocumentArray<Application>;
	employees: mongoose.Types.DocumentArray<Employee>;
	properties: mongoose.Types.DocumentArray<Property>;
	createdAt: Date;
}

export const CorporationSchema = new mongoose.Schema<Corporation>(
	{
		guild: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
		owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
		name: { type: mongoose.Schema.Types.String, required: true },
		industry: { type: mongoose.Schema.Types.String, required: true },
		description: { type: mongoose.Schema.Types.String, required: true },
		balance: { type: mongoose.Schema.Types.Number, required: true },
		applications: { type: [ApplicationSchema] },
		employees: { type: [EmployeeSchema] },
		properties: { type: [PropertySchema] },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
		versionKey: false,
	},
);

export const CorporationModel: mongoose.Model<Corporation> = mongoose.model('Corporation', CorporationSchema);
