import { Snowflake, SnowflakeUtil } from 'discord.js';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	Relation,
} from 'typeorm';

import { ListingString } from '../typings';
import { Guild } from '.';

@Entity()
export class Listing extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Guild, { onDelete: 'CASCADE' })
	@JoinColumn()
	public guild: Relation<Guild>;

	@Column({ type: 'character varying' })
	public type: ListingString;

	@Column({ type: 'character varying' })
	public name: string;

	@Column({ type: 'integer' })
	public price: number;

	@Column({ type: 'integer' })
	public treasuryRequired: number;

	@Column({ type: 'boolean' })
	public active: boolean;

	@Column({ type: 'character varying' })
	public description: string;

	@Column({ type: 'boolean' })
	public stackable: boolean;

	@Column({ type: 'boolean' })
	public tradeable: boolean;

	@Column({ type: 'float4' })
	public stock: number;

	@Column({ type: 'float4' })
	public duration: number;

	@ManyToMany(() => Listing, (listing) => listing.itemsRequired, { onDelete: 'CASCADE' })
	@JoinTable()
	public itemsRequired: Relation<Listing>[];

	@Column({ type: 'simple-array' })
	public rolesRequired: Snowflake[];

	@Column({ type: 'simple-array' })
	public rolesGranted: Snowflake[];

	@Column({ type: 'simple-array' })
	public rolesRemoved: Snowflake[];

	@Column({ type: 'integer', nullable: true })
	public generatorPeriod: number | null;

	@Column({ type: 'integer', nullable: true })
	public generatorAmount: number | null;

	@CreateDateColumn({ type: 'timestamp' })
	public createdAt: Date;
}
