import mongoose from 'mongoose';
import { Ref, getModelForClass, prop } from '@typegoose/typegoose';

import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { OccupationString } from '../typings/index.js';
import { Member } from './index.js';

export class Application extends TimeStamps {
	@prop({ ref: () => Member })
	public member: Ref<Member>;

	@prop({ type: mongoose.Schema.Types.String, required: true })
	public occupation: OccupationString;

	@prop({ type: mongoose.Schema.Types.String, required: true })
	public content: string;

	@prop({ default: true })
	public pending: boolean;

	@prop({ default: false })
	public accepted: boolean;
}

export const ApplicationModel = getModelForClass(Application);
