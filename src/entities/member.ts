import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { Command, Guild, User } from '.';

@Entity()
export class Member extends BaseEntity {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake;

	@OneToOne(() => User, (user) => user.id)
	@JoinColumn()
		user: Relation<User>;

	@ManyToOne(() => Guild, (guild) => guild.members)
	@JoinColumn()
		guild: Relation<Guild>;

	@OneToMany(() => Command, (command) => command.member)
		commands: Promise<Relation<Command>[]>;

	@Column({ type: 'decimal', default: 0 })
		treasury: number;

	@Column({ type: 'decimal', default: 0 })
		wallet: number;
}
