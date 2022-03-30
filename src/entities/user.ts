import { Snowflake } from 'discord.js';
import { BaseEntity, Column, Entity } from 'typeorm';

@Entity({ name: 'discuser' })
export class User extends BaseEntity {
	@Column({ primary: true })
	public id: Snowflake;

	@Column({ default: 0 })
	public keys: number;
}
