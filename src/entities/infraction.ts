import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { InfractionString } from '../typings/index.js';
import { Guild, Member } from './index.js';

@Entity()
export class Infraction extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Guild)
	@JoinColumn()
		guild: Relation<Guild>;

	@ManyToOne(() => Member)
	@JoinColumn()
		target: Relation<Member>;

	@ManyToOne(() => Member)
	@JoinColumn()
		agent: Relation<Member>;

	@Column()
		type: InfractionString;

	@Column()
		reason: string;

	@Column({ nullable: true })
		active: boolean | null;

	@Column({ nullable: true })
		duration: number | null;

	@Column({ nullable: true })
		permanent: boolean | null;

	@CreateDateColumn()
		createdAt: Date;
}
