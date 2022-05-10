import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, Relation } from 'typeorm';

import { ListingString } from '../typings/index.js';
import { Guild } from './index.js';

@Entity()
export class Listing extends BaseEntity {
	@Column({ primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Guild)
	@JoinColumn()
	public guild: Relation<Guild>;

	@Column()
	public type: ListingString;

	@Column()
	public name: string;

	@Column()
	public price: number;

	@Column()
	public treasuryRequired: number;

	@Column()
	public active: boolean;

	@Column()
	public description: string;

	@Column()
	public stackable: boolean;

	@Column({ type: 'float4' })
	public stock: number;

	@Column({ type: 'float4' })
	public duration: number;

	@ManyToMany(() => Listing, (listing) => listing.itemsRequired)
	@JoinColumn()
	public itemsRequired: Listing[];

	@Column('simple-array')
	public rolesRequired: Snowflake[];

	@Column('simple-array')
	public rolesGiven: Snowflake[];

	@Column('simple-array')
	public rolesRemoved: Snowflake[];

	@Column({ nullable: true })
	public generatorPeriod: number;

	@Column({ nullable: true })
	public generatorAmount: number;

	@CreateDateColumn()
	public createdAt: Date;
}
