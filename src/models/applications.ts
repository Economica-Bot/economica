import mongoose from 'mongoose';
import { OccupationString } from '../typings/index.js';
import { Member } from './index.js';

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
