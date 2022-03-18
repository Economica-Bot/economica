import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { Guild, User } from './index.js';

@Entity()
export class Member extends BaseEntity {
	@PrimaryColumn()
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => User)
	@JoinColumn()
	public user: Relation<User>;

	@ManyToOne(() => Guild)
	@JoinColumn()
	public guild: Relation<Guild>;

	@Column({ type: 'float', default: 0 })
	public treasury: number;

	@Column({ type: 'float', default: 0 })
	public wallet: number;
}
