import * as mongoose from 'mongoose';

import { InfractionString, NonReqBoolean, NonReqNum, ReqString } from '../structures';

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
		guildId: ReqString,
		userId: ReqString,
		agentId: ReqString,
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
