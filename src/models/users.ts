import * as mongoose from 'mongoose';
import { ModuleOwnership } from '../typings';

export interface User {
	userId: string;
	keys: number;
	modules: ModuleOwnership[];
}

const Schema = new mongoose.Schema<User>(
	{
		userId: { type: String, required: true },
		keys: { type: Number, default: 0 },
		modules: { type: Array<ModuleOwnership>(), default: [] },
	},
	{ strict: true, versionKey: false }
);

export const UserModel: mongoose.Model<User> = mongoose.model('Users', Schema);
