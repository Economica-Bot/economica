import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	Relation
} from 'typeorm';
import { z } from 'zod';

import { InfractionString, InfractionStringArr } from '../typings';
import { Guild, GuildSchema } from './guild';
import { Member, MemberSchema } from './member';

@Entity({ name: 'infraction' })
export class Infraction extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: string = DiscordSnowflake.generate().toString();

	@ManyToOne(() => Guild)
	@JoinColumn()
	public guild!: Relation<Guild>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public target!: Relation<Member>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public agent!: Relation<Member>;

	@Column({ type: 'character varying' })
	public type!: InfractionString;

	@Column({ type: 'character varying' })
	public reason!: string;

	@Column({ type: 'boolean', nullable: true })
	public active!: boolean | null;

	@Column({ type: 'integer', nullable: true })
	public duration!: number | null;

	@Column({ type: 'boolean', nullable: true })
	public permanent!: boolean | null;

	@CreateDateColumn({ type: 'timestamp' })
	public createdAt!: Date;
}

export const InfractionSchema = z.object({
	id: z.string(),
	guild: GuildSchema,
	target: MemberSchema,
	agent: MemberSchema,
	type: z.enum(InfractionStringArr),
	reason: z.string(),
	active: z.boolean(),
	duration: z.number(),
	permanent: z.boolean(),
	createdAt: z.date()
});
