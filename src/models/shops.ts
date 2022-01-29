import * as mongoose from 'mongoose';

interface Shop {
	guildId: string;
	type: string;
	name: string;
	price: number;
	active: boolean;
	description: string;
	duration: number;
	stackable: boolean;
	stock: number;
	rolesGiven: string[];
	rolesRemoved: string[];
	rolesRequired: string[];
	itemsRequired: string[];
	bankRequired: number;
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
		active: { type: Boolean, required: true },
		description: { type: String, required: true },
		duration: { type: Number, required: true },
		stackable: { type: Boolean, required: true },
		stock: { type: Number, required: true },
		rolesGiven: { type: Array<String>(), required: true },
		rolesRemoved: { type: Array<String>(), required: true },
		requiredRoles: { type: Array<String>(), required: true },
		requiredItems: { type: Array<String>(), required: true },
		requiredBank: { type: Number, required: true },
		generatorPeriod: { type: Number, required: true },
		generatorAmount: { type: Number, required: true },
		createdAt: { type: Date, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const ShopModel: mongoose.Model<Shop> = mongoose.model('Shop_Items', Schema);
