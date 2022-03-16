import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { AuthorityString, AuthorityType } from '../typings/index.js';
import { Guild } from './index.js';

@Entity()
export class Authority extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake;

	@ManyToOne(() => Guild, (guild) => guild.auth)
		guild: Relation<Guild>;

	@Column()
		type: AuthorityType;

	@Column()
		authority: AuthorityString;

	override toString(): string {
		return this.type === 'ROLE'
			? `<@&${this.id}>`
			: `<@${this.id}>`;
	}
}
