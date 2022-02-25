import { getModelForClass, prop } from '@typegoose/typegoose';

import { PropertyString } from '../typings';

export class Property {
	@prop({ required: true })
	public type: PropertyString;
}

export const PropertySchema = getModelForClass(Property);
