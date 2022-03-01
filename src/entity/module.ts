import { Column, Entity, JoinColumn, OneToOne, Relation } from 'typeorm';

import { ModuleString } from '../typings';
import { Guild } from './guild';
import { User } from './user';

@Entity()
export class Module {
	@OneToOne(() => User, (user) => user.id, { primary: true })
	@JoinColumn({ name: 'userId' })
		user: Relation<User>;

	@OneToOne(() => Guild, (guild) => guild.id, { primary: true })
	@JoinColumn({ name: 'guildId' })
		guild: Relation<Guild>;

	@Column({ primary: true })
		module: ModuleString;
}
