import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';
import { Member } from './index.js';

@Entity()
export class Command extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Member, { eager: true })
	@JoinColumn()
	public member: Relation<Member>;

	@Column({ type: 'character varying' })
	public command: string;

	@CreateDateColumn({ type: 'timestamp without time zone' })
	public createdAt: Date;
}
