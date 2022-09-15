import { DiscordSnowflake } from '@sapphire/snowflake';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';
import { Member } from '.';

@Entity({ name: 'command' })
export class Command extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: string = DiscordSnowflake.generate().toString();

	@ManyToOne(() => Member, { onDelete: 'CASCADE' })
	@JoinColumn()
	public member: Relation<Member>;

	@Column({ type: 'character varying' })
	public command: string;

	@CreateDateColumn({ type: 'timestamp' })
	public createdAt: Date;
}
