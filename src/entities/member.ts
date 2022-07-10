import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { Guild, User } from './index.js';

@Entity()
export class Member extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public userId: string;

	@Column({ type: 'character varying', primary: true })
	public guildId: string;

	@ManyToOne(() => User, (user) => user.id)
	@JoinColumn({ name: 'userId' })
	public user: Relation<User>;

	@ManyToOne(() => Guild, (guild) => guild.id)
	@JoinColumn({ name: 'guildId' })
	public guild: Relation<Guild>;

	@Column({ type: 'float', default: 0 })
	public treasury: number;

	@Column({ type: 'float', default: 0 })
	public wallet: number;
}
