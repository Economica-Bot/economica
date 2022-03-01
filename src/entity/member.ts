import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, Relation } from 'typeorm';
import { Command } from './command';
import { Guild } from './guild';
import { User } from './user';

@Entity()
export class Member {
	@OneToOne(() => User, (user) => user.id, { primary: true })
	@JoinColumn({ name: 'userId' })
		user: User;

	@ManyToOne(() => Guild, (guild) => guild.members, { primary: true })
	@JoinColumn({ name: 'guildId' })
		guild: Relation<Guild>;

	@OneToMany(() => Command, (command) => command.member)
		commands: Relation<Command>[];

	@Column({ type: 'double', default: 0 })
		treasury: number;

	@Column({ type: 'double', default: 0 })
		wallet: number;
}
