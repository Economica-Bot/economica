import * as mongoose from 'mongoose';

import { InfractionString } from '../typings';

export interface Infraction {
	guildId: string;
	userId: string;
	agentId: string;
	type: InfractionString;
	reason: string;
	permanent: boolean;
	active: boolean;
	duration: number;
	createdAt: Date;
}

const Schema = new mongoose.Schema<Infraction>(
	{
		guildId: { type: mongoose.Schema.Types.String, required: true },
		userId: { type: mongoose.Schema.Types.String, required: true },
		agentId: { type: mongoose.Schema.Types.String, required: true },
		type: { type: mongoose.Schema.Types.String, required: true },
		reason: { type: mongoose.Schema.Types.String, required: true },
		permanent: { type: mongoose.Schema.Types.Boolean, required: false },
		active: { type: mongoose.Schema.Types.Boolean, required: false },
		duration: { type: mongoose.Schema.Types.Number, required: false },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const InfractionModel: mongoose.Model<Infraction> = mongoose.model('Infractions', Schema);
