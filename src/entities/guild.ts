import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity } from 'typeorm';

import { DefaultCurrencySymbol, DefaultIncomesObj, DefaultIntervalsObj, DefaultModulesObj } from '../typings';

@Entity()
export class Guild extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: Snowflake;

	@Column({ type: 'character varying', default: DefaultCurrencySymbol })
	public currency: string;

	@Column({ type: 'character varying', default: null })
	public transactionLogId: string | null;

	@Column({ type: 'character varying', default: null })
	public infractionLogId: string | null;

	@Column({ type: 'jsonb', default: DefaultIncomesObj })
	public incomes: typeof DefaultIncomesObj;

	@Column({ type: 'jsonb', default: DefaultIntervalsObj })
	public intervals: typeof DefaultIntervalsObj;

	@Column({ type: 'jsonb', default: DefaultModulesObj })
	public modules: typeof DefaultModulesObj;
}
