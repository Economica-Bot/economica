import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Guild, Member } from './index.js';

@Entity()
export class Loan extends BaseEntity {
	@Column({ primary: true })
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

	@Column()
	public message: string;

	@Column()
	public principal: number;

	@Column()
	public repayment: number;

	@Column()
	public duration: number;

	@Column()
	public pending: boolean;

	@Column()
	public active: boolean;

	@Column({ default: null })
	public completedAt: Date;

	@CreateDateColumn()
	public createdAt: Date;
}
