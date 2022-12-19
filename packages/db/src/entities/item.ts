import { DiscordSnowflake } from '@sapphire/snowflake';
import { Column, Entity, ManyToOne, Relation } from 'typeorm';

import { Listing } from './listing';
import { Member } from './member';

@Entity({ name: 'item' })
export class Item {
	@Column({ type: 'character varying', primary: true })
	public id: string = DiscordSnowflake.generate().toString();

	@ManyToOne(() => Listing, { onDelete: 'CASCADE' })
	public listing!: Relation<Listing>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	public owner!: Relation<Member>;

	@Column({ type: 'integer' })
	public amount!: number;

	@Column({ type: 'timestamptz', default: null })
	public lastGeneratedAt!: Date;
}
