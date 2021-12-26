import * as mongoose from 'mongoose';
import { NonReqBoolean, NonReqDate, ReqString } from '../structures/Datatypes';

interface Infraction {
	guildID: string;
	userID: string;
	staffID: string;
	type: string;
	permanent: boolean;
	active: boolean;
	expires: Date;
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
		expires: NonReqDate,
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
