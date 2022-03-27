import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { Guild, User } from './index.js';

@Entity()
export class Member extends BaseEntity {
	@PrimaryColumn()
	public userId: string;

	@PrimaryColumn()
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
