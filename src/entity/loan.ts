import { Snowflake, SnowflakeUtil } from 'discord.js';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { Guild, Member } from './index.js';

@Entity()
export class Loan {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake;

	@OneToOne(() => Guild, (guild) => guild.id)
	@JoinColumn()
		guild: Relation<Guild>;

	@OneToOne(() => Member)
	@JoinColumn()
		lender: Relation<Member>;

	@OneToOne(() => Member)
	@JoinColumn()
		borrower: Relation<Member>;

	@Column()
		description: string;

	@Column()
		principal: number;

	@Column()
		repayment: number;

	@Column()
		valid: boolean;

	@Column()
		pending: boolean;

	@Column()
		active: boolean;

	@Column()
		complete: boolean;

	@Column('timestamp')
		createdAt: Date;

	@Column('timestamp')
		expiresAt: Date;
}
