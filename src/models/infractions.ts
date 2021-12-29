import * as mongoose from 'mongoose';
import { NonReqBoolean, NonReqDate, NonReqNum, ReqString } from '../structures/Datatypes';

interface Infraction {
	guildID: string;
	userID: string;
	staffID: string;
	type: string;
	permanent: boolean;
	active: boolean;
	duration: number;
}

const Schema = new mongoose.Schema<Infraction>(
	{
		guildID: ReqString,
		userID: ReqString,
		staffID: ReqString,
		type: ReqString,
		reason: ReqString,
		permanent: NonReqBoolean,
		active: NonReqBoolean,
		duration: NonReqNum,
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const InfractionModel: mongoose.Model<Infraction> = mongoose.model(
	'Infractions',
	Schema
);
