import { Snowflake } from 'discord-api-types/v10';
import { BaseEntity, Column, Entity } from 'typeorm';
import { z } from 'zod';

@Entity({ name: 'discuser' })
export class User extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id!: Snowflake;

	@Column({ type: 'integer', default: 0 })
	public keys!: number;
}

export const UserSchema = z.object({
	id: z.string(),
	keys: z.number().default(0)
});
