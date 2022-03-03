import { Snowflake, SnowflakeUtil } from 'discord.js';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { InfractionString } from '../typings/index.js';
import { Member } from './index.js';

@Entity()
export class Infraction {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake;

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
