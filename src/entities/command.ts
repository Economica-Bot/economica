import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { Member } from './index.js';

@Entity()
export class Command extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Member)
	@JoinColumn()
	public member: Relation<Member>;

	@Column()
	public command: string;

	@CreateDateColumn()
	public createdAt: Date;
}
