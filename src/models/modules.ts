import { Ref, getModelForClass, prop } from '@typegoose/typegoose';

import { ModuleString } from '../typings/index.js';
import { Guild, User } from './index.js';

export class Module {
	@prop({ ref: () => Guild })
	public guild: Ref<Guild>;

	@prop({ ref: () => User })
	public user: Ref<User>;

	@prop({ required: true })
	public module: ModuleString;
}

export const ModuleModel = getModelForClass(Module);
