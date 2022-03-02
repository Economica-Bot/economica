import { Snowflake } from 'discord.js';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { CURRENCY_SYMBOL } from '../config';
import { Authority } from './authority';
import { Incomes } from './incomes';
import { Intervals } from './intervals';
import { Member } from './member';
import { Module } from './module';

@Entity()
export class Guild {
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

	@OneToOne(() => Incomes, (incomes) => incomes.guild)
		incomes: Promise<Relation<Incomes>>;

	@OneToOne(() => Intervals, (intervals) => intervals.guild)
		intervals: Promise<Relation<Intervals>>;

	@OneToMany(() => Module, (module) => module.guild)
		modules: Promise<Relation<Module>[]>;
}
