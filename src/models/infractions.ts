import * as mongoose from 'mongoose';

import { Member } from '.';
import { InfractionString } from '../typings';

export interface Infraction extends mongoose.Types.Subdocument {
	agent: mongoose.PopulatedDoc<Member>;
	type: InfractionString;
	reason: string;
	permanent: boolean;
	active: boolean;
	duration: number;
	createdAt: Date;
}

export const InfractionSchema = new mongoose.Schema<Infraction>(
	{
		agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
		type: { type: mongoose.Schema.Types.String, required: true },
		reason: { type: mongoose.Schema.Types.String, required: true },
		permanent: { type: mongoose.Schema.Types.Boolean, required: false },
		active: { type: mongoose.Schema.Types.Boolean, required: false },
		duration: { type: mongoose.Schema.Types.Number, required: false },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
		versionKey: false,
	}
);

export const InfractionModel: mongoose.Model<Infraction> = mongoose.model('Infraction', InfractionSchema);
