import { BaseEntity, Column, Entity } from 'typeorm';

@Entity({ name: 'token' })
export class Token extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: string;

	@Column({ type: 'character varying' })
	public accessToken: string;

	@Column({ type: 'character varying' })
	public refreshToken: string;
}
