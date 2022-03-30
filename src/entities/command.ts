import { Snowflake, SnowflakeUtil } from 'discord.js';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';
import { Member } from './index.js';

@Entity()
export class Command extends BaseEntity {
	@Column({ primary: true })
	public id: Snowflake = SnowflakeUtil.generate().toString();

	@ManyToOne(() => Member, { eager: true })
	@JoinColumn()
	public member: Relation<Member>;

	@Column()
	public command: string;

	@CreateDateColumn()
	public createdAt: Date;
}
