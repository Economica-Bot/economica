import { Ref, getModelForClass, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

import { InfractionString } from '../typings/index.js';
import { Member } from './index.js';

export class Infraction extends TimeStamps {
	@prop({ ref: () => Member })
	public agent: Ref<Member>;

	@prop({ required: true })
	public type: InfractionString;

	@prop({ required: true })
	public reason: string;

	@prop({ default: true })
	public active: boolean;

	@prop({ default: false })
	public permanent: boolean;

	@prop({ default: null })
	public duration: number;
}

export const InfractionModel = getModelForClass(Infraction);
