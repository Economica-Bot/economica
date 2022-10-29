import {
	IncomeArr,
	InfractionStringArr,
	IntervalArr,
	ListingType,
	ModuleStringArr,
	ModuleTypeStringArr,
	TransactionStringArr
} from '@economica/common';
import { z } from 'zod';

export const IncomeCommandSchema = z.object({
	min: z.number().nullish(),
	max: z.number().nullish(),
	chance: z.number().nullish(),
	minfine: z.number().nullish(),
	maxfine: z.number().nullish(),
	cooldown: z.number().nullish()
});

export const IntervalCommandSchema = z.object({
	amount: z.number().optional(),
	cooldown: z.number().optional(),
	enabled: z.boolean().optional()
});

export const ModuleSchema = z.object({
	type: z.enum(ModuleTypeStringArr).optional(),
	enabled: z.boolean().optional(),
	user: z.string().nullish()
});

export const UserSchema = z.object({
	id: z.string(),
	keys: z.number().default(0)
});

export const GuildFindSchema = z.object({
	id: z.string()
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

export const MemberSchema = z.object({
	userId: z.string(),
	guildId: z.string(),
	user: UserSchema,
	guild: GuildSchema,
	treasury: z.number(),
	wallet: z.number()
});

export const MemberViewSchema = z.object({
	userId: z.string(),
	guildId: z.string(),
	user: UserSchema.optional(),
	guild: GuildSchema.optional(),
	treasury: z.number().optional(),
	wallet: z.number().optional()
});

export const MemberUpdateSchema = z.object({
	userId: z.string(),
	guildId: z.string(),
	user: UserSchema.optional(),
	guild: GuildSchema.optional(),
	treasury: z.number().optional(),
	wallet: z.number().optional()
});

export const CommandSchema = z.object({
	id: z.string(),
	member: MemberSchema,
	command: z.string(),
	createdAt: z.date()
});

export interface Listing {
	id: string;
	guild: z.infer<typeof GuildSchema>;
	type: ListingType;
	name: string;
	price: number;
	description: string;
	treasuryRequired: number;
	active: boolean;
	stackable: boolean;
	tradeable: boolean;
	stock: number;
	duration: number;
	itemsRequired: Listing[];
	rolesRequired: string[];
	rolesGranted: string[];
	rolesRemoved: string[];
	generatorPeriod: number;
	generatorAmount: number;
	createdAt: Date;
}

export const ListingSchema: z.ZodType<Listing> = z.lazy(() =>
	z.object({
		id: z.string(),
		guild: GuildSchema,
		type: z.nativeEnum(ListingType),
		name: z.string(),
		price: z.number(),
		description: z.string(),
		treasuryRequired: z.number(),
		active: z.boolean(),
		stackable: z.boolean(),
		tradeable: z.boolean(),
		stock: z.number(),
		duration: z.number(),
		itemsRequired: z.array(ListingSchema),
		rolesRequired: z.array(z.string()),
		rolesGranted: z.array(z.string()),
		rolesRemoved: z.array(z.string()),
		generatorPeriod: z.number(),
		generatorAmount: z.number(),
		createdAt: z.date()
	})
);

export const LoanSchema = z.object({
	id: z.string(),
	guild: GuildSchema,
	lender: MemberViewSchema,
	borrower: MemberViewSchema,
	message: z.string(),
	principal: z.number(),
	repayment: z.number(),
	duration: z.number(),
	pending: z.boolean(),
	active: z.boolean(),
	completedAt: z.date(),
	createdAt: z.date()
});

export const TransactionUpdateSchema = z.object({
	id: z.string(),
	guild: GuildFindSchema.optional(),
	target: MemberViewSchema.optional(),
	agent: MemberViewSchema.optional(),
	type: z.enum(TransactionStringArr).optional(),
	wallet: z.number().optional(),
	treasury: z.number().optional()
});

export const TransactionCreateSchema = z.object({
	guild: GuildFindSchema,
	target: MemberViewSchema,
	agent: MemberViewSchema,
	type: z.enum(TransactionStringArr),
	wallet: z.number(),
	treasury: z.number()
});

export const InfractionSchema = z.object({
	id: z.string(),
	guild: GuildSchema,
	target: MemberSchema,
	agent: MemberSchema,
	type: z.enum(InfractionStringArr),
	reason: z.string(),
	active: z.boolean(),
	duration: z.number(),
	permanent: z.boolean(),
	createdAt: z.date()
});

export const ItemSchema = z.object({
	id: z.string(),
	listing: ListingSchema,
	owner: MemberSchema,
	amount: z.number(),
	lastGeneratedAt: z.date()
});
