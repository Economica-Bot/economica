import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { TransactionString } from '../typings/index.js';
import { Guild, Member } from './index.js';

@Entity()
export class Transaction extends BaseEntity {
	@PrimaryColumn()
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Guild)
	@JoinColumn()
	public guild: Relation<Guild>;

	@ManyToOne(() => Member)
	@JoinColumn()
	public target: Relation<Member>;

	@ManyToOne(() => Member)
	@JoinColumn()
	public agent: Relation<Member>;

	@Column()
	public type: TransactionString;

	@Column({ type: 'float' })
	public wallet: number;

	@Column({ type: 'float' })
	public treasury: number;

	@CreateDateColumn()
	public createdAt: Date;
}
