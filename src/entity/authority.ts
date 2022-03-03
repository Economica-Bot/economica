import { Snowflake, SnowflakeUtil } from 'discord.js';
import { Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { AuthorityString } from '../typings/index.js';
import { Guild } from './index.js';

@Entity()
export class Authority {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake;

	@ManyToOne(() => Guild, (guild) => guild.auth)
		guild: Relation<Guild>;

	@Column()
		subject: 'User' | 'Role';

	@Column()
		subjectId: Snowflake;

	@Column()
		authority: AuthorityString;
}
