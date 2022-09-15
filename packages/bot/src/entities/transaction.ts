import { DiscordSnowflake } from '@sapphire/snowflake';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Guild, Member } from '.';
import { TransactionString } from '../typings';

@Entity({ name: 'transaction' })
export class Transaction extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: string = DiscordSnowflake.generate().toString();

	@ManyToOne(() => Guild, { onDelete: 'CASCADE' })
	@JoinColumn()
	public guild: Relation<Guild>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public target: Relation<Member>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public agent: Relation<Member>;

	@Column({ type: 'character varying' })
	public type: TransactionString;

	@Column({ type: 'float' })
	public wallet: number;

	@Column({ type: 'float' })
	public treasury: number;

	@CreateDateColumn({ type: 'timestamp' })
	public createdAt: Date;
}
