import * as mongoose from 'mongoose';
import { ShopItem } from '../typings';

export interface Shop {
	guildId: string;
	type: ShopItem;
	name: string;
	price: number;
	treasuryRequired: number;
	active: boolean;
	description: string;
	duration: number;
	stackable: boolean;
	stock: number;
	rolesGiven: string[];
	rolesRemoved: string[];
	requiredRoles: string[];
	requiredItems: string[];
	generatorPeriod: number;
	generatorAmount: number;
	createdAt: Date;
}

const Schema = new mongoose.Schema<Shop>(
	{
		guildId: { type: mongoose.Schema.Types.String, required: true },
		type: { type: mongoose.Schema.Types.String, required: true },
		name: { type: mongoose.Schema.Types.String, required: true },
		price: { type: mongoose.Schema.Types.Number, required: true },
		treasuryRequired: { type: mongoose.Schema.Types.Number, required: true },
		active: { type: mongoose.Schema.Types.Boolean, required: true },
		description: { type: mongoose.Schema.Types.String, required: true },
		duration: { type: mongoose.Schema.Types.Number, required: true },
		stackable: { type: mongoose.Schema.Types.Boolean, required: true },
		stock: { type: mongoose.Schema.Types.Number, required: true },
		rolesGiven: { type: mongoose.Schema.Types.Array, required: true },
		rolesRemoved: { type: mongoose.Schema.Types.Array, required: true },
		requiredRoles: { type: mongoose.Schema.Types.Array, required: true },
		requiredItems: { type: mongoose.Schema.Types.Array, required: true },
		generatorPeriod: { type: mongoose.Schema.Types.Number, required: false },
		generatorAmount: { type: mongoose.Schema.Types.Number, required: false },
		createdAt: { type: mongoose.Schema.Types.Date, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const ShopModel: mongoose.Model<Shop> = mongoose.model('Shops', Schema);
