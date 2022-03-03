import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { ModuleString } from '../typings/index.js';
import { Guild, User } from './index.js';

@Entity()
export class Module {
	@PrimaryColumn()
		id: Snowflake;

	@BeforeInsert()
	private beforeInsert() {
		this.id = SnowflakeUtil.generate();
	}

	@ManyToOne(() => User, (user) => user.id)
	@JoinColumn()
		user: Relation<User>;

	@ManyToOne(() => Guild, (guild) => guild.id)
	@JoinColumn()
		guild: Relation<Guild>;

	@Column()
		module: ModuleString;
}
