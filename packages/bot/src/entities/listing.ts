import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	Relation
} from 'typeorm';
import { z } from 'zod';
import { ListingType } from '../typings';

import { Guild, GuildSchema } from './guild';

@Entity({ name: 'listing' })
export class Listing extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: string = DiscordSnowflake.generate().toString();

	@ManyToOne(() => Guild, { onDelete: 'CASCADE' })
	@JoinColumn()
	public guild!: Relation<Guild>;

	@Column({ type: 'character varying' })
	public type!: keyof typeof ListingType;

	@Column({ type: 'character varying' })
	public name!: string;

	@Column({ type: 'integer' })
	public price!: number;

	@Column({ type: 'character varying' })
	public description!: string;

	@Column({ type: 'integer' })
	public treasuryRequired!: number;

	@Column({ type: 'boolean' })
	public active!: boolean;

	@Column({ type: 'boolean' })
	public stackable!: boolean;

	@Column({ type: 'boolean' })
	public tradeable!: boolean;

	@Column({ type: 'float4' })
	public stock!: number;

	@Column({ type: 'float4' })
	public duration!: number;

	@ManyToMany(() => Listing, (listing) => listing.itemsRequired, {
		onDelete: 'CASCADE'
	})
	@JoinTable()
	public itemsRequired!: Relation<Listing>[];

	@Column({ type: 'simple-array' })
	public rolesRequired!: string[];

	@Column({ type: 'simple-array' })
	public rolesGranted!: string[];

	@Column({ type: 'simple-array' })
	public rolesRemoved!: string[];

	@Column({ type: 'integer', nullable: true })
	public generatorPeriod!: number | null;

	@Column({ type: 'integer', nullable: true })
	public generatorAmount!: number | null;

	@CreateDateColumn({ type: 'timestamp' })
	public createdAt!: Date;
}

export const ListingSchema = z.object({
	id: z.string(),
	guild: GuildSchema,
	type: z.nativeEnum(ListingType),
	name: z.string(),
	price: z.number(),
	description: z.string(),
	treasuryRequired: z.number(),
	active: z.boolean(),
	stackable: z.boolean(),
	tradeable: z.boolean(),
	stock: z.number(),
	duration: z.number(),
	itemsRequired: z.array(ListingSchema),
	rolesRequired: z.array(z.string()),
	rolesGranted: z.array(z.string()),
	rolesRemoved: z.array(z.string()),
	generatorPeriod: z.number(),
	generatorAmount: z.number(),
	createdAt: z.date()
});
