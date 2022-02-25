import { getModelForClass, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class Experience extends TimeStamps {
	@prop({ required: true })
	public amount: number;
}

export const ExperienceModel = getModelForClass(Experience);
