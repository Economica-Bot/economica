import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import { Member } from './member';
import { CURRENCY_SYMBOL } from '../config';

@Entity()
export class Guild {
	@PrimaryColumn()
		id: string;

	@OneToMany(() => Member, (member) => member.guild)
		members: Relation<Member>[];

	@Column({ default: CURRENCY_SYMBOL })
		currency: string;
}
