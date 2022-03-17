import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { Guild, User } from './index.js';

@Entity()
export class Member extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => User, (user) => user.id, { eager: true })
	@JoinColumn()
		user: Relation<User>;

	@ManyToOne(() => Guild)
	@JoinColumn()
		guild: Relation<Guild>;

	@Column({ type: 'float', default: 0 })
		treasury: number;

	@Column({ type: 'float', default: 0 })
		wallet: number;
}
