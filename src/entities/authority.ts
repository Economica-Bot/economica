import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { AuthorityString } from '../typings/index.js';
import { Guild } from './index.js';

@Entity()
export class Authority extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake;

	@ManyToOne(() => Guild, (guild) => guild.auth)
		guild: Relation<Guild>;

	@Column()
		type: 'User' | 'Role';

	@Column()
		authority: AuthorityString;
}
