import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { Guild, Member } from './index.js';

@Entity()
export class Loan extends BaseEntity {
	@PrimaryColumn()
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@OneToOne(() => Guild, (guild) => guild.id)
	@JoinColumn()
	public guild: Relation<Guild>;

	@OneToOne(() => Member)
	@JoinColumn()
	public lender: Relation<Member>;

	@OneToOne(() => Member)
	@JoinColumn()
	public borrower: Relation<Member>;

	@Column()
	public description: string;

	@Column()
	public principal: number;

	@Column()
	public repayment: number;

	@Column()
	public duration: number;

	@Column()
	public valid: boolean;

	@Column()
	public pending: boolean;

	@Column()
	public active: boolean;

	@Column()
	public complete: boolean;

	@CreateDateColumn()
	public createdAt: Date;
}
