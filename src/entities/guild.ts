import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity } from 'typeorm';

import { CURRENCY_SYMBOL } from '../config.js';
import { defaultIncomesObj, defaultIntervalsObj, defaultModulesObj } from '../typings';

@Entity()
export class Guild extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: Snowflake;

	@Column({ type: 'character varying', default: CURRENCY_SYMBOL })
	public currency: string;

	@Column({ type: 'character varying', default: null })
	public transactionLogId: string | null;

	@Column({ type: 'character varying', default: null })
	public infractionLogId: string | null;

	@Column({ type: 'jsonb', default: defaultIncomesObj })
	public incomes: typeof defaultIncomesObj;

	@Column({ type: 'jsonb', default: defaultIntervalsObj })
	public intervals: typeof defaultIntervalsObj;

	@Column({ type: 'jsonb', default: defaultModulesObj })
	public modules: typeof defaultModulesObj;
}
