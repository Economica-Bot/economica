import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { Listing } from './index.js';

@Entity()
export class Item extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake = SnowflakeUtil.generate();

	@OneToOne(() => Listing, (listing) => listing.id)
		listing: Relation<Listing>;

	@Column()
		amount: number;
}
