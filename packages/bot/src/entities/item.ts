import { DiscordSnowflake } from '@sapphire/snowflake';
import { BaseEntity, Column, Entity, ManyToOne, Relation } from 'typeorm';
import { z } from 'zod';
import { Listing, ListingSchema } from './listing';
import { Member, MemberSchema } from './member';

@Entity({ name: 'item' })
export class Item extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: string = DiscordSnowflake.generate().toString();

	@ManyToOne(() => Listing, { onDelete: 'CASCADE' })
	public listing!: Relation<Listing>;

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	public owner!: Relation<Member>;

	@Column({ type: 'integer' })
	public amount!: number;

	@Column({ type: 'timestamp', default: null })
	public lastGeneratedAt!: Date;
}

export const ItemSchema = z.object({
	id: z.string(),
	listing: ListingSchema,
	owner: MemberSchema,
	amount: z.number(),
	lastGeneratedAt: z.date()
});
