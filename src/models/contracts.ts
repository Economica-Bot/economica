import { getModelForClass, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class Contract extends TimeStamps {
	@prop({ required: true })
	public expires: Date;

	@prop({ required: true })
	public wage: number;

	@prop({ required: true })
	public cooldown: number;
}

export const ContractModel = getModelForClass(Contract);
