import mongoose from 'mongoose';

import { PropertyString } from '../typings';

export interface Property extends mongoose.Types.Subdocument {
	type: PropertyString;
}

export const PropertySchema = new mongoose.Schema<Property>(
	{
		type: { type: mongoose.Schema.Types.String, required: true },
	},
	{ versionKey: false },
);

export const PropertyModel: mongoose.Model<Property> = mongoose.model('Property', PropertySchema);
