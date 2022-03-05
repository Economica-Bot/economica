import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { InfractionString } from '../typings';
import { Member } from '.';

@Entity()
export class Infraction extends BaseEntity {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake;

	@ManyToOne(() => Member, (member) => member.commands)
	@JoinColumn()
		target: Relation<Member>;

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
