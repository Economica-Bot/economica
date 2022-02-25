import { Ref, getModelForClass, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

import { Contract, Experience, Member } from './index.js';

export class Employee extends TimeStamps {
	@prop({ ref: () => Member })
	public member: Ref<Member>;

	@prop({ type: () => Contract })
	public contracts: Contract[];

	@prop({ type: () => Experience })
	public experience: Experience[];

	@prop({ default: false })
	public active: boolean;
}

export const EmployeeModel = getModelForClass(Employee);
