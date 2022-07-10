import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { TransactionString } from '../typings/index.js';
import { Guild, Member } from './index.js';

@Entity()
export class Transaction extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
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

	@Column({ type: 'character varying' })
	public type: TransactionString;

	@Column({ type: 'float' })
	public wallet: number;

	@Column({ type: 'float' })
	public treasury: number;

	@CreateDateColumn({ type: 'time without time zone' })
	public createdAt: Date;
}
