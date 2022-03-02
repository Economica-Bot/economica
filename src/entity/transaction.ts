import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

import { TransactionString } from '../typings/index.js';
import { Guild, Member } from './index.js';

@Entity()
export class Transaction {
	@PrimaryGeneratedColumn()
		id: number;

	@OneToOne(() => Guild, (guild) => guild.id)
	@JoinColumn()
		guild: Relation<Guild>;

	@OneToOne(() => Member)
	@JoinColumn()
		target: Relation<Member>;

	@OneToOne(() => Member)
	@JoinColumn()
		agent: Relation<Member>;

	@Column()
		type: TransactionString;

	@Column()
		wallet: number;

	@Column()
		treasury: number;

	@Column({ type: 'timestamp', primary: true })
		createdAt: Date;
}
