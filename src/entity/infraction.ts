import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { InfractionString } from '../typings';

import { Member } from './member';

@Entity()
export class Infraction {
	@PrimaryGeneratedColumn()
		id: number;

	@ManyToOne(() => Member, (member) => member.commands)
	@JoinColumn([
		{ name: 'guildId', referencedColumnName: 'guildId' }, // default name = 'memberGuildId'
		{ name: 'userId', referencedColumnName: 'userId' },
	])
		member: Relation<Member>;

	@OneToOne(() => Member, { eager: true })
	@JoinColumn()
		agent: Relation<Member>;

	@Column()
		type: InfractionString;

	@Column()
		reason: string;

	@Column()
		permanent: boolean;

	@Column()
		active: boolean;

	@Column()
		duration: number;

	@Column({ type: 'timestamp' })
		createdAt: Date;
}
