import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BeforeInsert, Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { AuthorityString } from '../typings/index.js';
import { Guild } from './index.js';

@Entity()
export class Authority {
	@PrimaryColumn()
		id: Snowflake;

	@BeforeInsert()
	private beforeInsert() {
		this.id = SnowflakeUtil.generate();
	}

	@ManyToOne(() => Guild, (guild) => guild.auth)
		guild: Relation<Guild>;

	@Column()
		subject: 'User' | 'Role';

	@Column()
		subjectId: Snowflake;

	@Column()
		authority: AuthorityString;
}
