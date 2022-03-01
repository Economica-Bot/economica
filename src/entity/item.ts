import { Entity, ManyToOne, OneToOne } from "typeorm";
import { Member } from "./member";

@Entity()
export class Item {
	@ManyToOne(() => Member, (member) => member.items)
		member: Member;

	@OneToOne(() => Listing, (listing) => listing.id)
}