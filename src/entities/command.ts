import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { Member } from './index.js';

@Entity()
export class Command extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake = SnowflakeUtil.generate();

	@ManyToOne(() => Member)
	@JoinColumn()
		member: Relation<Member>;

	@Column()
		command: string;

	@CreateDateColumn()
		createdAt: Date;
}