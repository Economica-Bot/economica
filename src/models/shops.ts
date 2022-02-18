import * as mongoose from 'mongoose';

import { Guild } from '.';
import { ShopItem } from '../typings';

export interface Shop extends mongoose.Document {
	guild: mongoose.PopulatedDoc<Guild>;
	type: ShopItem;
	name: string;
	price: number;
	usability: string;
	treasuryRequired: number;
	active: boolean;
	description: string;
	duration: number;
	stackable: boolean;
	stock: number;
	rolesGiven: string[];
	rolesRemoved: string[];
	requiredRoles: string[];
	requiredItems: mongoose.Types.DocumentArray<Shop>;
	generatorPeriod: number;
	generatorAmount: number;
	createdAt: Date;
}

export const ShopSchema = new mongoose.Schema<Shop>(
	{
		guild: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
		type: { type: mongoose.Schema.Types.String, required: true },
		name: { type: mongoose.Schema.Types.String, required: true },
		price: { type: mongoose.Schema.Types.Number, required: true },
		usability: { type: mongoose.Schema.Types.String, required: true },
		treasuryRequired: { type: mongoose.Schema.Types.Number, required: true },
		active: { type: mongoose.Schema.Types.Boolean, required: true },
		description: { type: mongoose.Schema.Types.String, required: true },
		duration: { type: mongoose.Schema.Types.Number, required: true },
		stackable: { type: mongoose.Schema.Types.Boolean, required: true },
		stock: { type: mongoose.Schema.Types.Number, required: true },
		rolesGiven: { type: mongoose.Schema.Types.Array, required: true },
		rolesRemoved: { type: mongoose.Schema.Types.Array, required: true },
		requiredRoles: { type: mongoose.Schema.Types.Array, required: true },
		requiredItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }],
		generatorPeriod: { type: mongoose.Schema.Types.Number, required: false },
		generatorAmount: { type: mongoose.Schema.Types.Number, required: false },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
		versionKey: false,
	}
);

export const ShopModel: mongoose.Model<Shop> = mongoose.model('Shop', ShopSchema);
