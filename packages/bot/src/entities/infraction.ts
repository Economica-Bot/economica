import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Guild, Member } from '.';
import { InfractionString } from '../typings';

@Entity({ name: 'infraction' })
export class Infraction extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Guild)
	@JoinColumn()
	public guild: Relation<Guild>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public target: Relation<Member>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public agent: Relation<Member>;

	@Column({ type: 'character varying' })
	public type: InfractionString;

	@Column({ type: 'character varying' })
	public reason: string;

	@Column({ type: 'boolean', nullable: true })
	public active: boolean | null;

	@Column({ type: 'integer', nullable: true })
	public duration: number | null;

	@Column({ type: 'boolean', nullable: true })
	public permanent: boolean | null;

	@CreateDateColumn({ type: 'timestamp' })
	public createdAt: Date;
}
