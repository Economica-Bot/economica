import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';

import { Module } from '.';

@Entity()
export class User extends BaseEntity {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake;

	@OneToMany(() => Module, (module) => module.user)
		modules: Promise<Relation<Module>[]>;

	@Column({ default: 0 })
		keys: number;
}
