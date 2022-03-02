import { Column, Entity, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

import { Listing } from './index.js';

@Entity()
export class Item {
	@PrimaryGeneratedColumn()
		id: number;

	@OneToOne(() => Listing, (listing) => listing.id)
		listing: Relation<Listing>;

	@Column()
		amount: number;
}
