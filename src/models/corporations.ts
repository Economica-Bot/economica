import { Ref, getModelForClass, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

import { IndustryString } from '../typings/index.js';
import { Application, Employee, Guild, Member, Property } from './index.js';

export class Corporation extends TimeStamps {
	@prop({ ref: () => Guild })
	public guild: Ref<Guild>;

	@prop({ ref: () => Member })
	public member: Ref<Member>;

	@prop({ required: true })
	public name: string;

	@prop({ required: true })
	public industry: IndustryString;

	@prop({ required: true })
	public description: string;

	@prop({ required: true })
	public balance: number;

	@prop({ type: () => Application })
	public applications: Application[];

	@prop({ type: () => Employee })
	public employees: Employee[];

	@prop({ type: () => Property })
	public properties: Property[];
}

export const CorporationModel = getModelForClass(Corporation);
