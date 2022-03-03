import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { Member } from './index.js';

@Entity()
export class Command extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake;

	@BeforeInsert()
	private beforeInsert() {
		this.id = SnowflakeUtil.generate();
	}

	@ManyToOne(() => Member, (member) => member.commands)
	@JoinColumn()
		member: Relation<Member>;

	@Column()
		command: string;

	@Column('timestamp')
		createdAt: Date;
}
