import * as mongoose from 'mongoose';

import { UserModule } from '../typings';

export interface User {
	userId: string;
	keys: number;
	modules: UserModule[];
}

const Schema = new mongoose.Schema<User>(
	{
		userId: { type: mongoose.Schema.Types.String, required: true },
		keys: { type: mongoose.Schema.Types.Number, default: 0 },
		modules: { type: mongoose.Schema.Types.Array, default: [] },
	},
	{ strict: true, versionKey: false }
);

export const UserModel: mongoose.Model<User> = mongoose.model('Users', Schema);
