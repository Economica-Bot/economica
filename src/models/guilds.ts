import { getModelForClass, prop } from '@typegoose/typegoose';
import { Snowflake } from 'discord.js';
import { CURRENCY_SYMBOL } from '../config.js';

import { RoleAuthority, defaultIncomesObj, defaultIntervalsObj, defaultModulesArr, modulesArr } from '../typings/index.js';

export class Guild {
	@prop({ required: true })
	public guildId: Snowflake;

	@prop({ default: CURRENCY_SYMBOL })
	public currency: string;

	@prop({ required: true })
	public transactionLogId: Snowflake;

	@prop({ required: true })
	public infractionLogId: Snowflake;

	@prop({ required: true })
	public botLogId: Snowflake;

	@prop({ default: [] })
	public auth: RoleAuthority[];

	@prop({ default: defaultIncomesObj })
	public incomes: typeof defaultIncomesObj;

	@prop({ default: defaultIntervalsObj })
	public intervals: typeof defaultIntervalsObj;

	@prop({ default: defaultModulesArr })
	public modules: typeof modulesArr;
}
export const GuildModel = getModelForClass(Guild);
