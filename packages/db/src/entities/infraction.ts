import { InfractionString } from '@economica/common';
import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	Relation
} from 'typeorm';

import { Guild } from './guild';
import { Member } from './member';

@Entity({ name: 'infraction' })
export class Infraction<
	offense extends InfractionString = InfractionString
> extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: string = DiscordSnowflake.generate().toString();

	@ManyToOne(() => Guild)
	@JoinColumn()
	public guild!: Relation<Guild>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public target!: Relation<Member>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public agent!: Relation<Member>;

	@Column({ type: 'character varying' })
	public type!: offense;

	@Column({ type: 'character varying' })
	public reason!: string;

	@Column({ type: 'boolean', nullable: true })
	public active!: offense extends 'BAN' | 'MUTE' | 'TIMEOUT' ? boolean : null;

	@Column({ type: 'integer', nullable: true })
	public duration!: offense extends 'BAN' | 'MUTE' | 'TIMEOUT' ? number : null;

	@Column({ type: 'boolean', nullable: true })
	public permanent!: offense extends 'BAN' | 'MUTE' | 'TIMEOUT'
		? boolean
		: null;

	@CreateDateColumn({ type: 'timestamp' })
	public createdAt!: Date;

	public isBan(): this is Infraction<'BAN'> {
		return this.type === 'BAN';
	}
}
