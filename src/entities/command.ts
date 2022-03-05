import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { Member } from '.';

@Entity()
export class Command extends BaseEntity {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake = SnowflakeUtil.generate();

	@ManyToOne(() => Member, (member) => member.commands)
	@JoinColumn()
		member: Relation<Member>;

	@Column()
		command: string;

	@CreateDateColumn()
		createdAt: Date;
}
