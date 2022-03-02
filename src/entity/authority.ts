import { Snowflake } from 'discord.js';
import { Column, Entity, ManyToOne, Relation } from 'typeorm';

import { AuthorityString } from '../typings';
import { Guild } from './guild';

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
