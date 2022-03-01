import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import { Module } from './module';

@Entity()
export class User {
	@PrimaryColumn()
		id: string;

	@OneToMany(() => Module, (module) => module.user)
		modules: Relation<Module>[];

	@Column({ default: 0 })
		keys: number;
}
