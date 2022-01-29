import * as mongoose from 'mongoose';

import { InfractionString } from '../typings';

interface Infraction {
	guildId: string;
	userId: string;
	agentId: string;
	type: InfractionString;
	reason: string;
	permanent: boolean;
	active: boolean;
	duration: number;
}

const Schema = new mongoose.Schema<Infraction>(
	{
		guildId: { type: String, required: true },
		userId: { type: String, required: true },
		agentId: { type: String, required: true },
		type: { type: String, required: true },
		reason: { type: String, required: true },
		permanent: { type: Boolean, required: false },
		active: { type: Boolean, required: false },
		duration: { type: Number, required: false },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const InfractionModel: mongoose.Model<Infraction> = mongoose.model('Infractions', Schema);
