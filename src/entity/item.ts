import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BeforeInsert, Column, Entity, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { Listing } from './index.js';

@Entity()
export class Item {
	@PrimaryColumn()
		id: Snowflake;

	@BeforeInsert()
	private beforeInsert() {
		this.id = SnowflakeUtil.generate();
	}

	@OneToOne(() => Listing, (listing) => listing.id)
		listing: Relation<Listing>;

	@Column()
		amount: number;
}
