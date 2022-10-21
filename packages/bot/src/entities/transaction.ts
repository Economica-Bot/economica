import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne
} from 'typeorm';

import type { Relation } from 'typeorm';

import { z } from 'zod';
import { TransactionString, TransactionStringArr } from '../typings';
import { Guild, GuildSchema } from './guild';
import { Member, MemberSchema } from './member';

@Entity({ name: 'transaction' })
export class Transaction extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: string = DiscordSnowflake.generate().toString();

	@ManyToOne(() => Guild, { onDelete: 'CASCADE' })
	@JoinColumn()
	public guild!: Relation<Guild>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public target!: Relation<Member>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public agent!: Relation<Member>;

	@Column({ type: 'character varying' })
	public type!: TransactionString;

	@Column({ type: 'float' })
	public wallet!: number;

	@Column({ type: 'float' })
	public treasury!: number;

	@CreateDateColumn({ type: 'timestamp' })
	public createdAt!: Date;
}

export const TransactionSchema = z.object({
	id: z.string(),
	guild: GuildSchema,
	target: MemberSchema,
	agent: MemberSchema,
	type: z.enum(TransactionStringArr),
	wallet: z.number(),
	treasury: z.number(),
	createdAt: z.date()
});
