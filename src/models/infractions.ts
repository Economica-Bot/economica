import * as mongoose from 'mongoose';
import { InfractionType } from '../structures/Datatypes';
import { InfractionTypes, NonReqBoolean, NonReqNum, ReqString } from '../structures/index';

interface Infraction {
	guildId: string;
	userId: string;
	agentId: string;
	type: InfractionTypes;
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
		type: InfractionType,
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
