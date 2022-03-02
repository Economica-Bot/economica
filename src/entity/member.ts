import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, Relation } from 'typeorm';
import { Command } from './command';
import { Guild } from './guild';
import { User } from './user';

@Entity()
export class Member {
	@PrimaryColumn()
		userId: string;

	@PrimaryColumn()
		guildId: string;

	@OneToOne(() => User, (user) => user.id, { primary: true })
	@JoinColumn()
		user: Relation<User>;

	@ManyToOne(() => Guild, (guild) => guild.members, { primary: true })
	@JoinColumn()
		guild: Relation<Guild>;

	@OneToMany(() => Command, (command) => command.member)
		commands: Promise<Relation<Command>[]>;

	@Column({ type: 'double', default: 0 })
		treasury: number;

	@Column({ type: 'double', default: 0 })
		wallet: number;
}
