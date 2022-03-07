import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { TransactionString } from '../typings/index.js';
import { Guild, Member } from './index.js';

@Entity()
export class Transaction extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake = SnowflakeUtil.generate();

	@ManyToOne(() => Guild)
	@JoinColumn()
		guild: Relation<Guild>;

	@ManyToOne(() => Member)
	@JoinColumn()
		target: Relation<Member>;

	@ManyToOne(() => Member)
	@JoinColumn()
		agent: Relation<Member>;

	@Column()
		type: TransactionString;

	@Column({ type: 'float' })
		wallet: number;

	@Column({ type: 'float' })
		treasury: number;

	@CreateDateColumn()
		createdAt: Date;
}
