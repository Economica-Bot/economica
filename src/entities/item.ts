import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, Entity, ManyToOne, Relation } from 'typeorm';

import { Listing, Member } from './index.js';

@Entity()
export class Item extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Listing, { onDelete: 'CASCADE' })
	public listing: Relation<Listing>;

	@ManyToOne(() => Member)
	public owner: Relation<Member>;

	@Column({ type: 'integer' })
	public amount: number;

	@Column({ type: 'time without time zone', default: null })
	public lastGeneratedAt: Date;
}
