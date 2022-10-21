import { BaseEntity, Column, Entity } from 'typeorm';
import { z } from 'zod';
import {
	DefaultCurrencySymbol,
	DefaultIncomesObj,
	DefaultIntervalsObj,
	DefaultModulesObj,
	IncomeArr,
	IntervalArr,
	ModuleStringArr,
	ModuleTypeStringArr
} from '../typings';

@Entity({ name: 'guild' })
export class Guild extends BaseEntity {
	@Column({ type: 'character varying', primary: true })
	public id!: string;

	@Column({ type: 'character varying', default: DefaultCurrencySymbol })
	public currency!: string;

	@Column({ type: 'character varying', default: null, nullable: true })
	public transactionLogId!: string | null;

	@Column({ type: 'character varying', default: null, nullable: true })
	public infractionLogId!: string | null;

	@Column({ type: 'jsonb', default: DefaultIncomesObj })
	public incomes!: typeof DefaultIncomesObj;

	@Column({ type: 'jsonb', default: DefaultIntervalsObj })
	public intervals!: typeof DefaultIntervalsObj;

	@Column({ type: 'jsonb', default: DefaultModulesObj })
	public modules!: typeof DefaultModulesObj;
}

const IncomeCommandSchema = z.object({
	min: z.number().nullish(),
	max: z.number().nullish(),
	chance: z.number().nullish(),
	minfine: z.number().nullish(),
	maxfine: z.number().nullish(),
	cooldown: z.number().nullish()
});

const IntervalCommandSchema = z.object({
	amount: z.number().optional(),
	cooldown: z.number().optional(),
	enabled: z.boolean().optional()
});

const ModuleSchema = z.object({
	type: z.enum(ModuleTypeStringArr).optional(),
	enabled: z.boolean().optional(),
	user: z.string().nullish()
});

export const GuildSchema = z.object({
	id: z.string().optional(),
	currency: z.string().optional(),
	transactionLogId: z.string().nullish(),
	infractionLogId: z.string().nullish(),
	incomes: z.record(z.enum(IncomeArr), IncomeCommandSchema).optional(),
	intervals: z.record(z.enum(IntervalArr), IntervalCommandSchema).optional(),
	modules: z.record(z.enum(ModuleStringArr), ModuleSchema).optional()
});
