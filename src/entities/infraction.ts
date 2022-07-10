import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { InfractionString } from '../typings/index.js';
import { Guild, Member } from './index.js';

@Entity()
export class Infraction extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Guild)
	@JoinColumn()
	public guild: Relation<Guild>;

	@ManyToOne(() => Member)
	@JoinColumn()
	public target: Relation<Member>;

	@ManyToOne(() => Member)
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

	@CreateDateColumn({ type: 'timestamp without time zone' })
	public createdAt: Date;
}
