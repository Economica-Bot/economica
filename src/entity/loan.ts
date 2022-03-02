import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Guild } from './guild';
import { Member } from './member';

@Entity()
export class Loan {
	@PrimaryGeneratedColumn()
		id: number;

	@OneToOne(() => Guild, (guild) => guild.id)
	@JoinColumn()
		guild: Relation<Guild>;

	@OneToOne(() => Member)
	@JoinColumn()
		lender: Relation<Member>;

	@OneToOne(() => Member)
	@JoinColumn()
		borrower: Relation<Member>;

	@Column()
		description: string;

	@Column()
		principal: number;

	@Column()
		repayment: number;

	@Column()
		valid: boolean;

	@Column()
		pending: boolean;

	@Column()
		active: boolean;

	@Column()
		complete: boolean;

	@Column({ type: 'timestamp' })
		createdAt: Date;

	@Column({ type: 'timestamp' })
		expiresAt: Date;
}
