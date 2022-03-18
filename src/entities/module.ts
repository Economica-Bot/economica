import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { ModuleString } from '../typings/index.js';
import { Guild, User } from './index.js';

@Entity()
export class Module extends BaseEntity {
	@PrimaryColumn()
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => User, (user) => user.id)
	@JoinColumn()
	public user: Relation<User>;

	@ManyToOne(() => Guild, (guild) => guild.id)
	@JoinColumn()
	public guild: Relation<Guild>;

	@Column()
	public module: ModuleString;
}
