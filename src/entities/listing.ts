import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';

import { ListingString } from '../typings/index.js';

@Entity()
export class Listing extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake = SnowflakeUtil.generate();

	@Column()
		type: ListingString;

	@Column()
		name: string;

	@Column()
		price: number;

	@Column()
		treasuryRequired: number;

	@Column()
		active: boolean;

	@Column()
		description: string;

	@Column()
		stackable: boolean;

	@Column()
		stock: number;

	@Column('simple-array')
		rolesRequired: Snowflake[];

	@Column('simple-array')
		rolesGiven: Snowflake[];

	@Column('simple-array')
		rolesRemoved: Snowflake[];

	@OneToMany(() => Listing, (listing) => listing.itemsRequired)
	@JoinColumn()
		itemsRequired: Promise<Listing[]>;

	@Column()
		generatorPeriod: number;

	@Column()
		generatorAmount: number;

	@CreateDateColumn()
		createdAt: Date;

	@Column('timestamp')
		expiresAt: Date;
}
