import { Ref, getModelForClass, prop } from '@typegoose/typegoose';

import { TransactionString } from '../typings/index.js';
import { Guild, Member } from './index.js';

export class Transaction {
	@prop({ ref: () => Guild })
	public guild: Ref<Guild>;

	@prop({ ref: () => Member })
	public target: Ref<Member>;

	@prop({ ref: () => Member })
	public agent: Ref<Member>;

	@prop({ required: true })
	public type: TransactionString;

	@prop({ required: true })
	public wallet: number;

	@prop({ required: true })
	public treasury: number;
}

export const TransactionModel = getModelForClass(Transaction);
