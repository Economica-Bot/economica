import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { InfractionString } from '../typings/index.js';
import { Guild, Member } from './index.js';

@Entity()
export class Infraction extends BaseEntity {
	@Column({ primary: true })
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

	@Column()
	public type: InfractionString;

	@Column()
	public reason: string;

	@Column({ nullable: true })
	public active: boolean | null;

	@Column({ nullable: true })
	public duration: number | null;

	@Column({ nullable: true })
	public permanent: boolean | null;

	@CreateDateColumn()
	public createdAt: Date;
}
