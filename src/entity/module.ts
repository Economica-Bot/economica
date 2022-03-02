import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { ModuleString } from '../typings';
import { Guild } from './guild';
import { User } from './user';

@Entity()
export class Module {
	@ManyToOne(() => User, (user) => user.id, { primary: true })
	@JoinColumn()
		user: Relation<User>;

	@ManyToOne(() => Guild, (guild) => guild.id, { primary: true })
	@JoinColumn()
		guild: Relation<Guild>;

	@Column({ primary: true })
		module: ModuleString;
}
