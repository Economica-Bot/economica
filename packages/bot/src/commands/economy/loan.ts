/* eslint-disable max-classes-per-file */
import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { User as DiscordUser } from 'discord.js';
import ms from 'ms';
import { FindOptionsWhere, IsNull, Not } from 'typeorm';

import { Loan, Member, User } from '../../entities';
import { recordTransaction, VariableCollector } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('loan')
		.setModule('ECONOMY')
		.setFormat('loan')
		.setDescription('Borrow and lend out money to other members');

	public execution = new Router()
		.get('', () => new ExecutionNode()
			.setName('Loan Dashboard')
			.setDescription('View or propose a loan')
			.setOptions(
				['select', '/view', 'View', 'View active, pending, and completed loans'],
				['select', '/propose', 'Propose', 'Propose, or create a new loan'],
			))
		.get('/view', () => new ExecutionNode()
			.setName('Viewing loans')
			.setDescription('View different types of loans you are involved in')
			.setOptions(
				['select', '/view/pending', 'Pending', 'View pending loans'],
				['select', '/view/active', 'Active', 'View active loans'],
				['select', '/view/complete', 'Complete', 'View complete loans'],
				['back', ''],
			))
		.get('/view/:type', async (ctx, params) => {
			const { type } = params;
			const where: FindOptionsWhere<Loan>[] = [
				{ lender: { userId: ctx.interaction.user.id }, pending: type === 'pending', active: type === 'active', completedAt: type === 'complete' ? Not(IsNull()) : null },
				{ borrower: { userId: ctx.interaction.user.id }, pending: type === 'pending', active: type === 'active', completedAt: type === 'complete' ? Not(IsNull()) : null },
			];
			const loans = await Loan.find({ relations: ['guild', 'lender', 'borrower'], where });
			return new ExecutionNode()
				.setName(`Viewing ${type} Loans`)
				.setDescription(`There are \`${loans.length}\` ${type} loans.`)
				.setOptions(
					...loans.map((loan) => ([
						'select',
						`/view/${type}/${loan.id}`,
						`Loan ${loan.id}`,
						`>>> **Created At**: \`${loan.createdAt.toLocaleString()}\`\n**Completed At**: \`${loan.completedAt?.toLocaleString() || 'N/A'}\``,
					]) as ['select', string, string, string]),
					['back', '/view'],
				);
		})
		.get('/view/:type/:id', async (ctx, params) => {
			const { type, id } = params;
			const loan = await Loan.findOneBy({ id });
			const options: typeof ExecutionNode.prototype.options = [];
			if (loan.pending && loan.borrower.userId === ctx.interaction.user.id) options.push(['button', `/view/${type}/${id}/accept`, 'Accept']);
			if (loan.pending && loan.lender.userId === ctx.interaction.user.id) options.push(['button', `/view/${type}/${id}/cancel`, 'Cancel']);
			return new ExecutionNode()
				.setName(`Loan ${loan.id}`)
				.setDescription(`>>> **Created At**: \`${loan.createdAt.toLocaleString()}\`\n**Completed At**: \`${loan.completedAt?.toLocaleString() || 'N/A'}\``)
				.setOptions(
					['displayInline', '🤵‍♂️ Lender', `<@!${loan.lender.userId}>`],
					['displayInline', `${Emojis.PERSON_ADD} Borrower`, `<@!${loan.borrower.userId}>`],
					['display', `${Emojis.DEED} Message`, `*${loan.message}*`],
					['displayInline', `${Emojis.ECON_DOLLAR} Principal`, `${loan.guild.currency} \`${parseNumber(loan.principal ?? 0)}\``],
					['displayInline', `${Emojis.CREDIT} Repayment`, `${loan.guild.currency} \`${parseNumber(loan.repayment ?? 0)}\``],
					['displayInline', `${Emojis.TIME} Duration`, `\`${ms(loan.duration ?? 0, { long: true })}\``],
					...options,
					['back', `/view/${type}`],
				);
		})
		.get('/view/:type/:id/cancel', async (ctx, params) => {
			const { id } = params;
			const loan = await Loan.findOneBy({ id });
			if (loan.active) throw new Error('This loan has been accepted already.');
			await loan.remove();
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_CANCEL', loan.principal, 0);
			return new ExecutionNode()
				.setName('Cancelled!')
				.setDescription(`${Emojis.CROSS} **Loan Cancelled**`)
				.setOptions(['back', '']);
		})
		.get('/view/:type/:id/accept', async (ctx, params) => {
			const { id } = params;
			const loan = await Loan.findOneBy({ id });
			loan.pending = false;
			loan.active = true;
			await loan.save();
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_ACCEPT', loan.principal, 0);
			return new ExecutionNode()
				.setName('Accepted!')
				.setDescription(`${Emojis.CHECK} **Loan Accepted**`)
				.setOptions(['back', '']);
		})
		.get('/propose', async (ctx) => {
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

			const loan = await Loan.create({
				guild: ctx.guildEntity,
				lender: ctx.memberEntity,
				borrower: borrowerEntity,
				principal,
				repayment,
				message,
				duration,
				pending: false,
				active: false,
				createdAt: new Date(),
			}).save();
			const { id } = loan;

			return new ExecutionNode()
				.setName('Loan Proposal')
				.setDescription('Proposing a loan!')
				.setOptions(
					['displayInline', '🤵‍♂️ Lender', `<@!${loan.lender.userId}>`],
					['displayInline', `${Emojis.PERSON_ADD} Borrower`, `<@!${loan.borrower.userId}>`],
					['display', `${Emojis.DEED} Message`, `*${loan.message}*`],
					['displayInline', `${Emojis.ECON_DOLLAR} Principal`, `${loan.guild.currency} \`${parseNumber(loan.principal ?? 0)}\``],
					['displayInline', `${Emojis.CREDIT} Repayment`, `${loan.guild.currency} \`${parseNumber(loan.repayment ?? 0)}\``],
					['displayInline', `${Emojis.TIME} Duration`, `\`${ms(loan.duration ?? 0, { long: true })}\``],
					['button', `/propose/${id}/cancel`, 'Cancel'],
					['button', `/propose/${id}/create`, 'Create'],
				);
		})
		.get('/propose/:id/cancel', async (ctx, params) => {
			const { id } = params;
			await Loan.delete({ id });
			return new ExecutionNode()
				.setName('Cancel')
				.setDescription(`${Emojis.CROSS} **Loan Proposal Cancelled**`)
				.setOptions(['back', '']);
		})
		.get('/propose/:id/create', async (ctx, params) => {
			const { id } = params;
			const loan = await Loan.findOneBy({ id });
			loan.pending = true;
			await loan.save();
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_PROPOSE', -loan.principal, 0);
			return new ExecutionNode()
				.setName('Create')
				.setDescription(`${Emojis.DEED} **Loan Proposed Successfully**`)
				.setOptions(['back', '']);
		});
}
