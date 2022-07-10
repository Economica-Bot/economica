import { BaseEntity, Column, Entity } from 'typeorm';

@Entity({ name: 'session' })
export class Session extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public sid: string;

	@Column({ type: 'time without time zone' })
	public expire: Date;

	@Column({ type: 'jsonb' })
	public sess: JSON;
}
