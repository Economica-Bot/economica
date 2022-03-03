import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { Command, Guild, User } from './index.js';

@Entity()
export class Member extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake;

	@BeforeInsert()
	private beforeInsert() {
		this.id = SnowflakeUtil.generate();
	}

	@OneToOne(() => User, (user) => user.id)
	@JoinColumn()
		user: Promise<Relation<User>>;

	@ManyToOne(() => Guild, (guild) => guild.members)
	@JoinColumn()
		guild: Promise<Relation<Guild>>;

	@OneToMany(() => Command, (command) => command.member)
		commands: Promise<Relation<Command>[]>;

	@Column({ type: 'double', default: 0 })
		treasury: number;

	@Column({ type: 'double', default: 0 })
		wallet: number;
}
