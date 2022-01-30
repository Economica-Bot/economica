import * as mongoose from 'mongoose';
import { ShopItem } from '../typings';

interface Shop {
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
	rolesRequired: string[];
	itemsRequired: string[];
	generatorPeriod: number;
	generatorAmount: number;
	createdAt: Date;
}

const Schema = new mongoose.Schema<Shop>(
	{
		guildId: { type: String, required: true },
		type: { type: String, required: true },
		name: { type: String, required: true },
		price: { type: Number, required: true },
		treasuryRequired: { type: Number, required: true },
		active: { type: Boolean, required: true },
		description: { type: String, required: true },
		duration: { type: Number, required: true },
		stackable: { type: Boolean, required: true },
		stock: { type: Number, required: true },
		rolesGiven: { type: Array<String>(), required: true },
		rolesRemoved: { type: Array<String>(), required: true },
		requiredRoles: { type: Array<String>(), required: true },
		requiredItems: { type: Array<String>(), required: true },
		generatorPeriod: { type: Number, required: true },
		generatorAmount: { type: Number, required: true },
		createdAt: { type: Date, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const ShopModel: mongoose.Model<Shop> = mongoose.model('Shops', Schema);
