import { TransactionString } from '@economica/common';
import { DiscordSnowflake } from '@sapphire/snowflake';
import type { Relation } from 'typeorm';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne
} from 'typeorm';
import { Guild } from './guild';
import { Member } from './member';

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
