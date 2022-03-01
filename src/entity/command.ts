import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';
import { Member } from './member';

@Entity()
export class Command {
	@ManyToOne(() => Member, (member) => member.commands, { primary: true })
	@JoinColumn([
		{ name: 'userId' },
		{ name: 'guildId' },
	])
		member: Relation<Member>;

	@Column({ primary: true })
		command: string;

	@CreateDateColumn({ primary: true })
		createdAt: Date;
}
