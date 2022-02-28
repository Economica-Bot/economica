import mongoose from 'mongoose';
import { IndustryString, OccupationString, PropertyString } from '../typings/index.js';

import { Guild, Member } from './index.js';

export interface Application extends mongoose.Types.Subdocument {
	member: mongoose.PopulatedDoc<Member>;
	occupation: OccupationString;
	content: string;
	pending: boolean;
	accepted: boolean;
	createdAt: Date;
}

export const ApplicationSchema = new mongoose.Schema<Application>(
	{
		member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
		occupation: { type: mongoose.Schema.Types.String, required: true },
		content: { type: mongoose.Schema.Types.String, required: true },
		pending: { type: mongoose.Schema.Types.Boolean, default: true },
		accepted: { type: mongoose.Schema.Types.Boolean, default: false },
	},
	{ timestamps: true, versionKey: false },
);

export const ApplicationModel: mongoose.Model<Application> = mongoose.model('Application', ApplicationSchema);

export interface Contract extends mongoose.Types.Subdocument {
	expires: Date;
	wage: number;
	cooldown: number;
}

export const ContractSchema = new mongoose.Schema<Contract>(
	{
		expires: { type: mongoose.Schema.Types.Date, required: true },
		wage: { type: mongoose.Schema.Types.Number, required: true },
		cooldown: { type: mongoose.Schema.Types.Number, required: true },
	},
	{ timestamps: true, versionKey: false },
);

export const ContractModel: mongoose.Model<Contract> = mongoose.model('Contract', ContractSchema);

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

export interface Property extends mongoose.Types.Subdocument {
	type: PropertyString;
}

export const PropertySchema = new mongoose.Schema<Property>(
	{
		type: { type: mongoose.Schema.Types.String, required: true },
	},
	{ versionKey: false },
);

export const PropertyModel: mongoose.Model<Property> = mongoose.model('Property', PropertySchema);

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
