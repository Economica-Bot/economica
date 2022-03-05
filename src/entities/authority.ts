import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { AuthorityString } from '../typings';
import { Guild } from '.';

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
