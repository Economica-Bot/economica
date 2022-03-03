import { Snowflake, SnowflakeUtil } from 'discord.js';
import { Column, Entity, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { Listing } from './index.js';

@Entity()
export class Item {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake;

	@OneToOne(() => Listing, (listing) => listing.id)
		listing: Relation<Listing>;

	@Column()
		amount: number;
}
