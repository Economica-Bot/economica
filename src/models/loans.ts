import { getModelForClass, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

import { Guild, Member } from './index.js';

export class Loan extends TimeStamps {
	@prop({ ref: () => Guild })
	public guild: Guild;

	@prop({ ref: () => Member })
	public borrower: Member;

	@prop({ ref: () => Member })
	public lender: Member;

	@prop({ required: true })
	public principal: number;

	@prop({ required: true })
	public repayment: number;

	@prop({ required: true })
	public expires: Date;

	@prop({ required: true })
	public pending: boolean;

	@prop({ required: true })
	public active: boolean;

	@prop({ required: true })
	public complete: true;
}
export const LoanModel = getModelForClass(Loan);
