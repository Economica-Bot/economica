import * as mongoose from 'mongoose';

import { ReqBoolean, ReqString } from '../structures';

interface Market {
	userId: string;
	guildId: string;
	item: string;
	price: number;
	description: string;
	active: boolean;
}

const Schema = new mongoose.Schema<Market>(
	{
		userId: ReqString,
		guildId: ReqString,
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

export const MarketModel: mongoose.Model<Market> = mongoose.model('Market_Items', Schema);
