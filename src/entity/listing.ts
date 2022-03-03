import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, BeforeInsert, Column, Entity, JoinColumn, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

import { ListingString } from '../typings/index.js';

@Entity()
export class Listing extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake;

	@BeforeInsert()
	private beforeInsert() {
		this.id = SnowflakeUtil.generate();
	}

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

	@Column('timestamp')
		expires: Date;

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

	@Column('timestamp')
		createdAt: Date;
}
