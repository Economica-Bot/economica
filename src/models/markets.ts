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
		userId: { type: mongoose.Schema.Types.String, required: true },
		guildId: { type: mongoose.Schema.Types.String, required: true },
		item: { type: mongoose.Schema.Types.String, required: true },
		price: { type: mongoose.Schema.Types.String, required: true },
		description: { type: mongoose.Schema.Types.String, required: true },
		active: { type: mongoose.Schema.Types.Boolean, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const MarketModel: mongoose.Model<Market> = mongoose.model('Markets', Schema);
