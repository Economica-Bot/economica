import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';

import { Authority, Member, Module } from '.';
import { CURRENCY_SYMBOL } from '../config';
import { defaultIncomesObj, defaultIntervalsObj } from '../typings';

@Entity()
export class Guild extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake;

	@OneToMany(() => Member, (member) => member.guild)
		members: Promise<Relation<Member>[]>;

	@Column({ default: CURRENCY_SYMBOL })
		currency: string;

	@Column({ default: null })
		transactionLogId: string;

	@Column({ default: null })
		infractionLogId: string;

	@OneToMany(() => Authority, (authority) => authority.guild)
		auth: Promise<Relation<Authority>[]>;

	@Column({ type: 'json', default: defaultIncomesObj })
		incomes: typeof defaultIncomesObj;

	@Column({ type: 'json', default: defaultIntervalsObj })
		intervals: typeof defaultIntervalsObj;

	@OneToMany(() => Module, (module) => module.guild)
		modules: Promise<Relation<Module>[]>;
}
