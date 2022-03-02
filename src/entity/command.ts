import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

import { Member } from './index.js';

@Entity()
export class Command extends BaseEntity {
	@PrimaryGeneratedColumn()
		id: number;

	@ManyToOne(() => Member, (member) => member.commands)
	@JoinColumn()
		member: Relation<Member>;

	@Column()
		command: string;

	@Column({ type: 'timestamp', primary: true })
		createdAt: Date;
}
