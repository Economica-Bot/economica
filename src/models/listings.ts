import { Ref, getModelForClass, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Snowflake } from 'discord.js';

import { ListingString } from '../typings/index.js';
import { Guild } from './index.js';

export class Listing extends TimeStamps {
	@prop({ ref: () => Guild })
	public guild: Ref<Guild>;

	@prop({ required: true })
	public type: ListingString;

	@prop({ required: true })
	public price: number;

	@prop({ required: true })
	public requiredTreasury: number;

	@prop({ required: true })
	public active: boolean;

	@prop({ required: true })
	public description: string;

	@prop({ required: true })
	public refundAmount: string;

	@prop({ required: true })
	public duration: number;

	@prop({ required: true })
	public stackable: boolean;

	@prop({ required: true })
	public stock: number;

	@prop({ required: true })
	public requiredRoles: Snowflake[];

	@prop({ required: true })
	public requiredItems: Ref<Listing>;

	@prop({ required: true })
	public rolesGiven: Snowflake[];

	@prop({ required: true })
	public rolesRemoved: Snowflake[];

	@prop({ required: true })
	public generatorPeriod: number;

	@prop({ required: true })
	public generatorAmount: number;
}

export const ListingModel = getModelForClass(Listing);
