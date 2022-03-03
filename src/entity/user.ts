import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';

import { Module } from './index.js';

@Entity()
export class User {
	@PrimaryColumn()
		id: Snowflake;

	@BeforeInsert()
	private beforeInsert() {
		this.id = SnowflakeUtil.generate();
	}

	@OneToMany(() => Module, (module) => module.user)
		modules: Promise<Relation<Module>[]>;

	@Column({ default: 0 })
		keys: number;
}
