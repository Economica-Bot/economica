import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Guild, Member } from './index.js';

@Entity()
export class Loan extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Guild, { eager: true })
	@JoinColumn()
	public guild: Relation<Guild>;

	@ManyToOne(() => Member, { eager: true })
	@JoinColumn()
	public lender: Relation<Member>;

	@ManyToOne(() => Member, { eager: true })
	@JoinColumn()
	public borrower: Relation<Member>;

	@Column({ type: 'character varying' })
	public message: string;

	@Column({ type: 'integer' })
	public principal: number;

	@Column({ type: 'integer' })
	public repayment: number;

	@Column({ type: 'integer' })
	public duration: number;

	@Column({ type: 'boolean' })
	public pending: boolean;

	@Column({ type: 'boolean' })
	public active: boolean;

	@Column({ type: 'time without time zone', default: null })
	public completedAt: Date;

	@CreateDateColumn({ type: 'time without time zone' })
	public createdAt: Date;
}
