import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { InfractionString } from '../typings/index.js';
import { Member } from './index.js';

@Entity()
export class Infraction {
	@PrimaryColumn()
		id: Snowflake;

	@BeforeInsert()
	private beforeInsert() {
		this.id = SnowflakeUtil.generate();
	}

	@ManyToOne(() => Member, (member) => member.commands)
	@JoinColumn()
		member: Relation<Member>;

	@OneToOne(() => Member)
	@JoinColumn()
		agent: Relation<Member>;

	@Column()
		type: InfractionString;

	@Column()
		reason: string;

	@Column()
		permanent: boolean;

	@Column()
		active: boolean;

	@Column()
		duration: number;

	@Column('timestamp')
		createdAt: Date;
}
