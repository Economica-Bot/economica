import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Relation } from 'typeorm';

import { ListingString } from '../typings/index.js';
import { Guild } from './index.js';

@Entity()
export class Listing extends BaseEntity {
	@PrimaryColumn()
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Guild)
	@JoinColumn()
	public guild: Relation<Guild>;

	@Column()
	public type: ListingString;

	@Column()
	public name: string;

	@Column()
	public price: number;

	@Column()
	public treasuryRequired: number;

	@Column()
	public active: boolean;

	@Column()
	public description: string;

	@Column()
	public stackable: boolean;

	@Column()
	public stock: number;

	@Column('simple-array')
	public rolesRequired: Snowflake[];

	@Column('simple-array')
	public rolesGiven: Snowflake[];

	@Column('simple-array')
	public rolesRemoved: Snowflake[];

	@OneToMany(() => Listing, (listing) => listing.itemsRequired)
	@JoinColumn()
	public itemsRequired: Promise<Listing[]>;

	@Column()
	public generatorPeriod: number | null;

	@Column()
	public generatorAmount: number | null;

	@CreateDateColumn()
	public createdAt: Date;

	@Column('timestamp')
	public expiresAt: Date;
}
