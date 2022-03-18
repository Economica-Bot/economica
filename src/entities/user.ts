import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';

import { Module } from './index.js';

@Entity({ name: 'discuser' })
export class User extends BaseEntity {
	@PrimaryColumn()
	public id: Snowflake;

	@OneToMany(() => Module, (module) => module.user)
	public modules: Promise<Relation<Module>[]>;

	@Column({ default: 0 })
	public keys: number;
}
