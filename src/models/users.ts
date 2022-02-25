import { getModelForClass, prop } from '@typegoose/typegoose';
import { Snowflake } from 'discord.js';

import { Module } from './index.js';

export class User {
	@prop({ required: true })
	public userId: Snowflake;

	@prop({ default: 0 })
	public keys: number;

	@prop({ type: () => Module })
	public modules: Module[];
}

export const UserModel = getModelForClass(User);
