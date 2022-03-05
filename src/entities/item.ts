import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { Listing } from '.';

@Entity()
export class Item extends BaseEntity {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake;

	@OneToOne(() => Listing, (listing) => listing.id)
		listing: Relation<Listing>;

	@Column()
		amount: number;
}
