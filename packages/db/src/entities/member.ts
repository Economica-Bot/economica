import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Guild } from './guild';
import { User } from './user';

@Entity({ name: 'member' })
export class Member {
	@Column({ type: 'character varying', primary: true })
	public userId!: string;

	@Column({ type: 'character varying', primary: true })
	public guildId!: string;

	@ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	public user!: Relation<User>;

	@ManyToOne(() => Guild, (guild) => guild.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'guildId' })
	public guild!: Relation<Guild>;

	@Column({ type: 'float', default: 0 })
	public treasury!: number;

	@Column({ type: 'float', default: 0 })
	public wallet!: number;
}
