import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { Listing, Member } from './index.js';

@Entity()
export class Item extends BaseEntity {
	@PrimaryColumn()
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Listing, (listing) => listing.id)
	public listing: Relation<Listing>;

	@ManyToOne(() => Member, (member) => member.id)
	public owner: Relation<Member>;

	@Column()
	public amount: number;

	@Column({ default: null })
	public lastGeneratedAt: Date;
}
