import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'discuser' })
export class User extends BaseEntity {
	@PrimaryColumn()
	public id: Snowflake;

	@Column({ default: 0 })
	public keys: number;
}
