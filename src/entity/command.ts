import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Member } from './member';

@Entity()
export class Command {
	@PrimaryGeneratedColumn()
		id: number;

	@ManyToOne(() => Member, (member) => member.commands)
	@JoinColumn()
		member: Relation<Member>;

	@Column()
		command: string;

	@Column({ type: 'timestamp', primary: true })
		createdAt: Date;
}
