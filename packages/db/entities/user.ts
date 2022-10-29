import { Snowflake } from 'discord-api-types/v10';
import { BaseEntity, Column, Entity } from 'typeorm';

@Entity({ name: 'discuser' })
export class User extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id!: Snowflake;

	@Column({ type: 'integer', default: 0 })
	public keys!: number;
}
