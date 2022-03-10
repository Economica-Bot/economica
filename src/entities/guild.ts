import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';

import { CURRENCY_SYMBOL } from '../config.js';
import { ModuleString, Modules, defaultIncomesObj, defaultIntervalsObj } from '../typings/index.js';
import { Authority } from './index.js';

@Entity()
export class Guild extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake;

	@Column({ default: CURRENCY_SYMBOL })
		currency: string;

	@Column({ default: null })
		transactionLogId: string | null;

	@Column({ default: null })
		infractionLogId: string | null;

	@OneToMany(() => Authority, (authority) => authority.guild, { eager: true })
		auth: Relation<Authority>[];

	@Column({ type: 'json', default: defaultIncomesObj })
		incomes: typeof defaultIncomesObj;

	@Column({ type: 'json', default: defaultIntervalsObj })
		intervals: typeof defaultIntervalsObj;

	@Column({ type: 'text', array: true })
		modules: ModuleString[] = (Object.keys(Modules) as ModuleString[]).filter((module) => Modules[module] === 'DEFAULT');
}
