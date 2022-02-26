import { Snowflake } from 'discord.js';
import mongoose from 'mongoose';

import { ListingString } from '../typings';

export interface Listing extends mongoose.Document {
	type: ListingString;
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
	rolesRemoved: Snowflake[];
	requiredRoles: Snowflake[];
	requiredItems: mongoose.Types.DocumentArray<Listing>;
	generatorPeriod: number;
	generatorAmount: number;
	createdAt: Date;
}

export const ListingSchema = new mongoose.Schema<Listing>(
	{
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
		rolesGiven: { type: [String] },
		rolesRemoved: { type: [String] },
		requiredRoles: { type: [String] },
		requiredItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true }],
		generatorPeriod: { type: mongoose.Schema.Types.Number, required: false },
		generatorAmount: { type: mongoose.Schema.Types.Number, required: false },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
		versionKey: false,
	},
);

export const ShopModel: mongoose.Model<Listing> = mongoose.model('Listing', ListingSchema);
