import { BaseEntity, Column, Entity } from 'typeorm';

@Entity({ name: 'session' })
export class Session extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public sid: string;

	@Column({ type: 'timestamp' })
	public expire: Date;

	@Column({ type: 'jsonb' })
	public sess: JSON;
}
