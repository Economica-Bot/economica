import { ApplicationCommandPermissionType, Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { Authorities } from '../typings/index.js';
import { Guild } from './index.js';

@Entity()
export class Authority extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake;

	@ManyToOne(() => Guild, (guild) => guild.auth)
		guild: Relation<Guild>;

	@Column()
		type: ApplicationCommandPermissionType;

	@Column()
		authority: Authorities;

	override toString(): string {
		return this.type === 1
			? `<@&${this.id}>`
			: `<@${this.id}>`;
	}
}
