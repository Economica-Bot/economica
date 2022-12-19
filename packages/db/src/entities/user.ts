import { Snowflake } from 'discord-api-types/v10';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'discuser' })
export class User {
	@Column({ type: 'character varying', primary: true })
	public id!: Snowflake;

	@Column({ type: 'integer', default: 0 })
	public keys!: number;
}
