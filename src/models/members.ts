import { Ref, getModelForClass, prop } from '@typegoose/typegoose';

import { Command, Guild, Infraction, InventoryItem, User } from './index.js';

export class Member {
	@prop({ ref: () => Guild })
	public guild: Ref<Guild>;

	@prop({ required: true })
	public user: Ref<User>;

	@prop({ required: true })
	public wallet: number;

	@prop({ required: true })
	public treasury: number;

	@prop({ type: () => Command })
	public commands: Command[];

	@prop({ type: () => InventoryItem })
	public inventory: InventoryItem[];

	@prop({ type: () => Infraction })
	public infractions: Infraction[];
}

export const MemberModel = getModelForClass(Member);
