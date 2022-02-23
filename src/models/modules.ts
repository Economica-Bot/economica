import mongoose from 'mongoose';

import { ModuleString } from '../typings';

export interface Module extends mongoose.Types.Subdocument {
	guild: mongoose.Types.ObjectId;
	user: mongoose.Types.ObjectId;
	module: ModuleString;
}

export const ModuleSchema = new mongoose.Schema<Module>(
	{
		guild: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		module: { type: mongoose.Schema.Types.String, required: true },
	},
	{
		strict: true,
		versionKey: false,
		timestamps: false,
	},
);

export const ModuleModel: mongoose.Model<Module> = mongoose.model('Module', ModuleSchema);
