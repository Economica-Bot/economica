import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { User as DiscordUser } from 'discord.js';
import ms from 'ms';
import { FindOptionsWhere, IsNull, Not } from 'typeorm';

import { Loan, Member, User } from '../../entities';
import { recordTransaction, VariableCollector } from '../../lib';
import { Command, Context, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';
import { Emojis } from '../../typings';

const displayLoan = (loan: Loan): ExecutionNode[] => [
	new ExecutionNode()
		.setName('🤵‍♂️ Lender')
		.setValue('loan_view_lender')
		.setType('displayInline')
		.setDescription(`<@!${loan.lender.userId}>`),
	new ExecutionNode()
		.setName(`${Emojis.PERSON_ADD} Borrower`)
		.setValue('loan_view_borrower')
		.setType('displayInline')
		.setDescription(`<@!${loan.borrower.userId}>`),
	new ExecutionNode()
		.setName(`${Emojis.DEED} Message`)
		.setValue('loan_view_message')
		.setType('display')
		.setDescription(`*${loan.message}*`),
	new ExecutionNode()
		.setName(`${Emojis.ECON_DOLLAR} Principal`)
		.setValue('loan_view_principal')
		.setType('displayInline')
		.setDescription(`${loan.guild.currency} \`${parseNumber(loan.principal ?? 0)}\``),
	new ExecutionNode()
		.setName(`${Emojis.CREDIT} Repayment`)
		.setValue('loan_view_repayment')
		.setType('displayInline')
		.setDescription(`${loan.guild.currency} \`${parseNumber(loan.repayment ?? 0)}\``),
	new ExecutionNode()
		.setName(`${Emojis.TIME} Duration`)
		.setValue('loan_view_duration')
		.setType('displayInline')
		.setDescription(`\`${ms(loan.duration ?? 0, { long: true })}\``),
];

const formatLoans = async (ctx: Context, type: 'pending' | 'active' | 'complete') => {
	const where: FindOptionsWhere<Loan>[] = [
		{ lender: { userId: ctx.interaction.user.id }, pending: type === 'pending', active: type === 'active', completedAt: type === 'complete' ? Not(IsNull()) : null },
		{ borrower: { userId: ctx.interaction.user.id }, pending: type === 'pending', active: type === 'active', completedAt: type === 'complete' ? Not(IsNull()) : null },
	];
	const loans = await Loan.find({ relations: ['guild', 'lender', 'borrower'], where });

	if (!loans.length) {
		return [
			new ExecutionNode()
				.setName('Nothing to see here!')
				.setValue('loan_view_none')
				.setType('display')
				.setDescription(`There are \`0\` ${type} loans. Come back another time!`),
		];
	}

	return loans.map((loan) => new ExecutionNode()
		.setName(`Loan ${loan.id}`)
		.setValue(`loan_view_${type}_${loan.id}`)
		.setType('select')
		.setDescription(`>>> **Created At**: \`${loan.createdAt.toLocaleString()}\`\n**Completed At**: \`${loan.completedAt.toLocaleString() || 'N/A'}\``)
		.setPagination(
			async () => ({ loan }),
			({ loan }) => [
				...displayLoan(loan),
				new ExecutionNode()
					.setName('Cancel')
					.setValue(`loan_${loan.id}_cancel`)
					.setType('button')
					.setDescription(`${Emojis.CROSS} **Loan Cancelled**`)
					.setDestination('loan_view')
					.setPredicate(() => loan.pending && loan.lender.userId === ctx.interaction.user.id)
					.setExecution(async () => {
						await loan.remove();
						await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_CANCEL', loan.principal, 0);
					}),
				new ExecutionNode()
					.setName('Accept')
					.setValue(`loan_${loan.id}_accept`)
					.setType('button')
					.setDescription(`${Emojis.CHECK} **Loan Accepted**`)
					.setDestination('loan_view')
					.setPredicate(() => loan.pending && loan.borrower.userId === ctx.interaction.user.id)
					.setExecution(async () => {
						loan.pending = false;
						loan.active = true;
						await loan.save();
						await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_ACCEPT', loan.principal, 0);
					}),
			],
		));
};

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('loan')
		.setDescription('Take out loans with other members')
		.setModule('ECONOMY')
		.setFormat('loan')
		.setExamples(['loan']);

	public test = new Map<string, ExecutionNode>()
		.set('loan', new ExecutionNode()
			.setDescription('Take out loans with other members')
			.addEndpoint('loan_view', 'select')
			.addEndpoint('loan_propose', 'select'))
		.set('loan_view', new ExecutionNode()
			.setDescription('View active, pending, and past loans')
			.addEndpoint('loan_view_pending', 'select')
			.addEndpoint('loan_view_active', 'select')
			.addEndpoint('loan_view_complete', 'select')
			.addEndpoint('loan_view_complete', 'back'))
		.set('loan_view_pending', new ExecutionNode()
			.setName('Pending')
			.setDescription('View pending loans')
			.setExecution(async (ctx) => {
				await formatLoans(ctx, 'pending');
			}));

	public execution = new ExecutionNode()
		.setName('Loan')
		.setValue('loan')
		.setDescription('Take out loans with other members')
		.setPagination(
			() => null,
			() => [
				new ExecutionNode()
					.setName('View')
					.setValue('loan_view')
					.setType('select')
					.setDescription('View active, pending, and past loans')
					.setPagination(
						() => null,
						() => [
							new ExecutionNode()
								.setName('Pending')
								.setValue('loan_view_pending')
								.setDescription('View pending loans')
								.setPagination(
									async (ctx) => ({ loans: await formatLoans(ctx, 'pending') }),
									({ loans }) => loans,
								),
							new ExecutionNode()
								.setName('Active')
								.setValue('loan_view_active')
								.setDescription('View active loans')
								.setPagination(
									async (ctx) => ({ loans: await formatLoans(ctx, 'active') }),
									({ loans }) => loans,
								),
							new ExecutionNode()
								.setName('Complete')
								.setValue('loan_view_complete')
								.setDescription('View complete loans')
								.setPagination(
									async (ctx) => ({ loans: await formatLoans(ctx, 'complete') }),
									({ loans }) => loans,
								),
						],
					),
				new ExecutionNode<'select'>()
					.setName('Propose')
					.setValue('loan_propose')
					.setDescription('Propose, or create, a loan')
					.setType('select')
					.setReturnable(false)
					.setPagination(
						async (ctx) => {
							const borrower = await new VariableCollector<DiscordUser>()
								.setProperty('borrower')
								.setPrompt('Specify a user')
								.addValidator((msg) => !!msg.mentions.users.size, 'Could not find a user mention.')
								.addValidator((msg) => msg.mentions.users.first().id !== msg.author.id, 'You cannot propose a loan to yourself.')
								.setParser((msg) => msg.mentions.users.first())
								.execute(ctx);
							const principal = await new VariableCollector<number>()
								.setProperty('principal')
								.setPrompt('Specify a principal amount')
								.addValidator((msg) => !!parseString(msg.content), 'Did not enter a numerical value.')
								.addValidator((msg) => parseString(msg.content) <= ctx.memberEntity.wallet, 'Principal exceeds current wallet balance.')
								.addValidator((msg) => parseString(msg.content) > 0, 'Principal must be more than 0.')
								.setParser((msg) => parseString(msg.content))
								.execute(ctx);
							const repayment = await new VariableCollector<number>()
								.setProperty('repayment')
								.setPrompt('Specify a repayment amount')
								.addValidator((msg) => !!parseString(msg.content), 'Did not enter a numerical value.')
								.addValidator((msg) => parseString(msg.content) > 0, 'Repayment must be more than 0.')
								.setParser((msg) => parseString(msg.content))
								.execute(ctx);
							const duration = await new VariableCollector<number>()
								.setProperty('duration')
								.setPrompt('Specify the duration of the loan')
								.addValidator((msg) => !!ms(msg.content), 'Did not enter a duration value.')
								.addValidator((msg) => ms(msg.content) > 0, 'Duration must be positive.')
								.setParser((msg) => ms(msg.content))
								.execute(ctx);
							const message = await new VariableCollector<string>()
								.setProperty('message')
								.setPrompt('Specify a loan message')
								.addValidator((msg) => !!msg.content, 'Input could not be parsed.')
								.setParser((msg) => msg.content)
								.execute(ctx);

							// Create borrower if not exist
							await User.upsert({ id: borrower.id }, ['id']);
							await Member.upsert({ userId: borrower.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
							const borrowerEntity = await Member.findOneBy({ userId: borrower.id, guildId: ctx.guildEntity.id });

							const loan = Loan.create({
								guild: ctx.guildEntity,
								lender: ctx.memberEntity,
								borrower: borrowerEntity,
								principal,
								repayment,
								message,
								duration,
								pending: true,
								active: false,
								createdAt: new Date(),
							});

							return { ctx, loan };
						},
						({ ctx, loan }) => [
							...displayLoan(loan),
							new ExecutionNode()
								.setName('Cancel')
								.setDescription(`${Emojis.CROSS} **Loan Proposal Cancelled**`)
								.setValue('loan_cancel')
								.setType('button')
								.setDestination('loan'),
							new ExecutionNode()
								.setName('Create')
								.setDescription(`${Emojis.DEED} **Loan Proposed Successfully**`)
								.setValue('loan_create')
								.setType('button')
								.setExecution(async () => {
									await loan.save();
									await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_PROPOSE', -loan.principal, 0);
								})
								.setDestination('loan'),
						],
					),
			],
		);
}
