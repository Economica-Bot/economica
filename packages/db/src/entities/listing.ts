import { ListingType } from '@economica/common';
import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	Relation
} from 'typeorm';

import { Guild } from './guild';

@Entity({ name: 'listing' })
export class Listing<type extends ListingType = ListingType> {
	@Column({ type: 'character varying', primary: true })
	public id: string = DiscordSnowflake.generate().toString();

	@ManyToOne(() => Guild, { onDelete: 'CASCADE' })
	@JoinColumn()
	public guild!: Relation<Guild>;

	@Column({ type: 'character varying', enum: ListingType })
	public type!: type;

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

	@Column({ type: 'integer', nullable: true })
	public stock!: number | null;

	@Column({ type: 'integer', nullable: true })
	public duration!: number | null;

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
	public generatorPeriod!: type extends ListingType.GENERATOR ? number : null;

	@Column({ type: 'integer', nullable: true })
	public generatorAmount!: type extends ListingType.GENERATOR ? number : null;

	@CreateDateColumn({ type: 'timestamptz' })
	public createdAt!: Date;
}

export const isGenerator = (
	listing: Listing
): listing is Listing<ListingType.GENERATOR> => {
	return listing.type === ListingType.GENERATOR;
};
