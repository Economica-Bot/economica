import * as mongoose from 'mongoose';

export interface Market {
	userId: string;
	guildId: string;
	item: string;
	price: number;
	description: string;
	active: boolean;
}

const Schema = new mongoose.Schema<Market>(
	{
		userId: { type: String, required: true },
		guildId: { type: String, required: true },
		item: { type: String, required: true },
		price: { type: String, required: true },
		description: { type: String, required: true },
		active: { type: Boolean, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const MarketModel: mongoose.Model<Market> = mongoose.model('Markets', Schema);
