import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';

import { Module } from './index.js';

@Entity({ name: 'discuser' })
export class User extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake;

	@OneToMany(() => Module, (module) => module.user)
		modules: Promise<Relation<Module>[]>;

	@Column({ default: 0 })
		keys: number;
}
