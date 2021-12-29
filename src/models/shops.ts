import * as mongoose from 'mongoose';
import { ReqBoolean, ReqDate, ReqNum, ReqString, ReqStringArr } from '../structures/index';

interface Shop {
	guildID: string;
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
		guildID: ReqString,
		type: ReqString,
		name: ReqString,
		price: ReqNum,
		active: ReqBoolean,
		description: ReqString,
		duration: ReqNum,
		stackable: ReqBoolean,
		stock: ReqNum,
		rolesGiven: ReqStringArr,
		rolesRemoved: ReqStringArr,
		requiredRoles: ReqStringArr,
		requiredItems: ReqStringArr,
		requiredBank: ReqNum,
		generatorPeriod: ReqNum, // generator intervals (ms)
		generatorAmount: ReqNum,
		createdAt: ReqDate,
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const ShopModel: mongoose.Model<Shop> = mongoose.model('Shop_Items', Schema);
