import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, Relation } from 'typeorm';

import { Listing, Member } from '.';

@Entity()
export class Market extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Listing, { onDelete: 'CASCADE' })
	public listing: Relation<Listing>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	public owner: Relation<Member>;

	@Column({ type: 'integer' })
	public amount: number;

	@Column({ type: 'integer' })
	public price: number;

	@CreateDateColumn({ type: 'timestamp' })
	public createdAt: Date;
}
