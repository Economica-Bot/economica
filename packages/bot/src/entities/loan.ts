import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	Relation
} from 'typeorm';
import { z } from 'zod';
import { Guild, GuildSchema } from './guild';
import { Member, MemberSchema } from './member';

@Entity({ name: 'loan' })
export class Loan extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id: string = DiscordSnowflake.generate().toString();

	@ManyToOne(() => Guild, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn()
	public guild!: Relation<Guild>;

	@ManyToOne(() => Member, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn()
	public lender!: Relation<Member>;

	@ManyToOne(() => Member, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn()
	public borrower!: Relation<Member>;

	@Column({ type: 'character varying' })
	public message!: string;

	@Column({ type: 'integer' })
	public principal!: number;

	@Column({ type: 'integer' })
	public repayment!: number;

	@Column({ type: 'integer' })
	public duration!: number;

	@Column({ type: 'boolean' })
	public pending!: boolean;

	@Column({ type: 'boolean' })
	public active!: boolean;

	@Column({ type: 'timestamp', default: null })
	public completedAt!: Date | null;

	@CreateDateColumn({ type: 'timestamp' })
	public createdAt!: Date;
}

export const LoanSchema = z.object({
	id: z.string(),
	guild: GuildSchema,
	lender: MemberSchema,
	borrower: MemberSchema,
	message: z.string(),
	principal: z.number(),
	repayment: z.number(),
	duration: z.number(),
	pending: z.boolean(),
	active: z.boolean(),
	completedAt: z.date(),
	createdAt: z.date()
});
