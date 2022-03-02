import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';

import { Module } from './index.js';

@Entity()
export class User {
	@PrimaryColumn()
		id: string;

	@OneToMany(() => Module, (module) => module.user)
		modules: Promise<Relation<Module>[]>;

	@Column({ default: 0 })
		keys: number;
}
