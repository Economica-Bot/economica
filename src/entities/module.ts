import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { ModuleString } from '../typings/index.js';
import { Guild, User } from './index.js';

@Entity()
export class Module extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake = SnowflakeUtil.generate();

	@ManyToOne(() => User, (user) => user.id)
	@JoinColumn()
		user: Relation<User>;

	@ManyToOne(() => Guild, (guild) => guild.id)
	@JoinColumn()
		guild: Relation<Guild>;

	@Column()
		module: ModuleString;
}
