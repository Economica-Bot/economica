import { BaseEntity, Column, Entity } from 'typeorm';

@Entity()
export class Token extends BaseEntity {
	@Column({ primary: true })
	public id: string;

	@Column()
	public accessToken: string;

	@Column()
	public refreshToken: string;
}
