import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, ManyToOne, Relation } from 'typeorm';

import { Listing, Member } from './index.js';

@Entity()
export class Item extends BaseEntity {
	@Column({ primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Listing, (listing) => listing.id)
	public listing: Relation<Listing>;

	@ManyToOne(() => Member)
	public owner: Relation<Member>;

	@Column()
	public amount: number;

	@Column({ default: null })
	public lastGeneratedAt: Date;
}
