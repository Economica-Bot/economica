import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { TransactionString } from '../typings/index.js';
import { Guild, Member } from './index.js';

@Entity()
export class Transaction {
	@PrimaryColumn()
		id: Snowflake;

	@BeforeInsert()
	private beforeInsert() {
		this.id = SnowflakeUtil.generate();
	}

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
