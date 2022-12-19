import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	Relation
} from 'typeorm';

import { Member } from './member';

@Entity({ name: 'command' })
export class Command {
	@Column({ type: 'character varying', primary: true })
	public id: string = DiscordSnowflake.generate().toString();

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public member!: Relation<Member>;

	@Column({ type: 'character varying' })
	public command!: string;

	@CreateDateColumn({ type: 'timestamptz' })
	public createdAt!: Date;
}
