import * as mongoose from 'mongoose';
import { NonReqBoolean, NonReqDate, NonReqNum, ReqString } from '../structures/index';

interface Infraction {
	guildId: string;
	userId: string;
	staffId: string;
	type: string;
	permanent: boolean;
	active: boolean;
	duration: number;
}

const Schema = new mongoose.Schema<Infraction>(
	{
		guildId: ReqString,
		userId: ReqString,
		staffId: ReqString,
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

export const InfractionModel: mongoose.Model<Infraction> = mongoose.model('Infractions', Schema);
