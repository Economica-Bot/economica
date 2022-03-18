import { Snowflake } from 'discord.js';
import Module from 'module';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';

import { CURRENCY_SYMBOL } from '../config.js';
import { defaultIncomesObj, defaultIntervalsObj } from '../typings/index.js';

@Entity()
export class Guild extends BaseEntity {
	@PrimaryColumn()
	public id: Snowflake;

	@Column({ default: CURRENCY_SYMBOL })
	public currency: string;

	@Column({ default: null })
	public transactionLogId: string | null;

	@Column({ default: null })
	public infractionLogId: string | null;

	@Column({ type: 'json', default: defaultIncomesObj })
	public incomes: typeof defaultIncomesObj;

	@Column({ type: 'json', default: defaultIntervalsObj })
	public intervals: typeof defaultIntervalsObj;

	@OneToMany(() => Module, (module) => module.id)
	public modules: Relation<Module>;
}
