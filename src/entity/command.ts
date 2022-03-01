import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { Member } from './member';

@Entity()
export class Command {
	@ManyToOne(() => Member, (member) => member.commands)
		member: Member;

	@Column()
		command: string;

	@CreateDateColumn()
		createdAt: Date;
}
