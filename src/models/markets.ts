import * as mongoose from 'mongoose';
import { ReqBoolean, ReqString } from '../structures/Datatypes';

interface Market {
	userID: string;
	guildID: string;
	item: string;
	price: number;
	description: string;
	active: boolean;
}

const Schema = new mongoose.Schema<Market>(
	{
		userID: ReqString,
		guildID: ReqString,
		item: ReqString,
		price: ReqString,
		description: ReqString,
		active: ReqBoolean,
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const MarketModel: mongoose.Model<Market> = mongoose.model(
	'Market_Items',
	Schema
);
