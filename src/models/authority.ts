import { Snowflake } from 'discord.js';
import mongoose from 'mongoose';

import { Authorities } from '../typings';

export interface Authority extends mongoose.Document {
	type: 'User' | 'Role';
	id: Snowflake;
	authority: keyof typeof Authorities;
}

export const AuthoritySchema = new mongoose.Schema<Authority>(
	{
		type: { type: mongoose.Schema.Types.String, enum: ['User', 'Role'], required: true },
		id: { type: mongoose.Schema.Types.String, required: true },
		authority: { type: mongoose.Schema.Types.String, enum: Authorities, required: true },
	},
);

export const AuthorityModel: mongoose.Model<Authority> = mongoose.model('Authority', AuthoritySchema);
