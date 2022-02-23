import { Snowflake } from 'discord.js';
import mongoose from 'mongoose';

import { ListingString } from '../typings/index.js';
import { Guild } from './index.js';

export interface Listing extends mongoose.Document {
	guild: mongoose.PopulatedDoc<Guild>;
	type: ListingString;
	name: string;
	price: number;
	requiredTreasury: number;
	active: boolean;
	description: string;
	duration: number;
	stackable: boolean;
	stock: number;
	requiredRoles: Snowflake[];
	requiredItems: mongoose.Types.DocumentArray<Listing>;
	rolesGiven: Snowflake[];
	rolesRemoved: Snowflake[];
	generatorPeriod: number | null;
	generatorAmount: number | null;
	createdAt: Date;
}

export const ListingSchema = new mongoose.Schema<Listing>(
	{
		guild: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
		type: { type: mongoose.Schema.Types.String, required: true },
		name: { type: mongoose.Schema.Types.String, required: true },
		price: { type: mongoose.Schema.Types.Number, required: true },
		requiredTreasury: { type: mongoose.Schema.Types.Number, required: true },
		active: { type: mongoose.Schema.Types.Boolean, required: true },
		description: { type: mongoose.Schema.Types.String, required: true },
		duration: { type: mongoose.Schema.Types.Number, required: true },
		stackable: { type: mongoose.Schema.Types.Boolean, required: true },
		stock: { type: mongoose.Schema.Types.Number, required: true },
		requiredRoles: { type: mongoose.Schema.Types.Array, required: true },
		requiredItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true }],
		rolesGiven: { type: mongoose.Schema.Types.Array, required: true },
		rolesRemoved: { type: mongoose.Schema.Types.Array, required: true },
		generatorPeriod: { type: mongoose.Schema.Types.Number, required: false },
		generatorAmount: { type: mongoose.Schema.Types.Number, required: false },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
		versionKey: false,
	},
);

export const ListingModel: mongoose.Model<Listing> = mongoose.model('Listing', ListingSchema);
