import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Relation, Column, Entity, ManyToOne } from 'typeorm';

import { Listing, Member } from '.';

@Entity({ name: 'item' })
export class Item extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Listing, { onDelete: 'CASCADE' })
	public listing: Relation<Listing>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	public owner: Relation<Member>;

	@Column({ type: 'integer' })
	public amount: number;

	@Column({ type: 'timestamp', default: null })
	public lastGeneratedAt: Date;
}