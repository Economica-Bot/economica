import { Snowflake } from 'discord.js';
import { Column, Entity, ManyToOne, Relation } from 'typeorm';

import { AuthorityString } from '../typings/index.js';
import { Guild } from './index.js';

@Entity()
export class Authority {
	@Column({ primary: true })
		id: Snowflake;

	@Column()
		type: 'User' | 'Role';

	@ManyToOne(() => Guild, (guild) => guild.auth)
		guild: Relation<Guild>;

	@Column()
		authority: AuthorityString;
}
