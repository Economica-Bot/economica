import * as mongoose from 'mongoose';

import { UserModule } from '../typings';

export interface User {
	userId: string;
	keys: number;
	modules: UserModule[];
}

const Schema = new mongoose.Schema<User>(
	{
		userId: { type: String, required: true },
		keys: { type: Number, default: 0 },
		modules: { type: Array<UserModule>(), default: [] },
	},
	{ strict: true, versionKey: false }
);

export const UserModel: mongoose.Model<User> = mongoose.model('Users', Schema);
