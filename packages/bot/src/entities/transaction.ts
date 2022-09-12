import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { TransactionString } from '../typings';
import { Guild, Member } from '.';

@Entity({ name: 'transaction' })
export class Transaction extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Guild, { onDelete: 'CASCADE' })
	@JoinColumn()
	public guild: Relation<Guild>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public target: Relation<Member>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public agent: Relation<Member>;

	@Column({ type: 'character varying' })
	public type: TransactionString;

	@Column({ type: 'float' })
	public wallet: number;

	@Column({ type: 'float' })
	public treasury: number;

	@CreateDateColumn({ type: 'timestamp' })
	public createdAt: Date;
}
