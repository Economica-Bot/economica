import { BaseEntity, Column, Entity } from 'typeorm';

@Entity({ name: 'session' })
export class Session extends BaseEntity {
	@Column({ primary: true })
	public sid: string;

	@Column()
	public expire: Date;

	@Column({ type: 'jsonb' })
	public sess: JSON;
}
