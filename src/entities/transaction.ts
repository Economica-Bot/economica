import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { TransactionString } from '../typings';
import { Guild, Member } from '.';

@Entity()
export class Transaction extends BaseEntity {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake;

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

	@Column('timestamp')
		createdAt: Date;
}
