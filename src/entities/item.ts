import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { Listing, Member } from './index.js';

@Entity()
export class Item extends BaseEntity {
	@PrimaryColumn()
		id: Snowflake = SnowflakeUtil.generate();

	@ManyToOne(() => Listing, (listing) => listing.id)
		listing: Relation<Listing>;

	@ManyToOne(() => Member, (member) => member.id)
		owner: Relation<Member>;

	@Column()
		amount: number;

	@Column({ default: null })
		lastGeneratedAt: Date;
}
