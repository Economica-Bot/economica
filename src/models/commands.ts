import { getModelForClass, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class Command extends TimeStamps {
	@prop()
	public command: string;
}

export const CommandModel = getModelForClass(Command);
