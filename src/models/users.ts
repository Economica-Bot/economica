import * as mongoose from 'mongoose';

import { Module } from '.';
import { ModuleSchema } from './modules';

export interface User extends mongoose.Document {
	userId: string;
	keys: number;
	modules: mongoose.Types.DocumentArray<Module>;
}

export const UserSchema = new mongoose.Schema<User>(
	{
		userId: { type: mongoose.Schema.Types.String, required: true },
		keys: { type: mongoose.Schema.Types.Number, default: 0 },
		modules: { type: [ModuleSchema], default: [] },
	},
	{
		versionKey: false,
	}
);

export const UserModel: mongoose.Model<User> = mongoose.model('User', UserSchema);
