import ms from 'ms';

import { getEconInfo, transaction, validateObjectId } from '../../lib/index.js';
import { LoanModel, MemberModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('loan')
		.setDescription('Loan money to other users.')
		.setModule('ECONOMY')
		.setFormat('<propose | cancel | accept | decline | view> [...arguments]')
		.setExamples([
			'loan view @user',
			'loan view 61199fcedfa37a179c65c37b',
			'loan propose @user 1000 1200 2d',
			'loan cancel 61199fcedfa37a179c65c37b',
			'loan accept 61199fcedfa37a179c65c37b',
			'loan decline 61199fcedfa37a179c65c37b',
		])
		.addSubcommand((subcommand) => subcommand
			.setName('view')
			.setDescription('View the loan registry')
			.addStringOption((option) => option.setName('loanid').setDescription('Specify a loan'))
			.addUserOption((option) => option.setName('user').setDescription('Specify a user')))
		.addSubcommand((subcommand) => subcommand
			.setName('propose')
			.setDescription('Add a loan to the registry.')
			.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
			.addIntegerOption((option) => option.setName('principal').setDescription('Specify the principal').setMinValue(1).setRequired(true))
			.addIntegerOption((option) => option.setName('repayment').setDescription('Specify the repayment').setMinValue(1).setRequired(true))
			.addStringOption((option) => option.setName('duration').setDescription('Specify the life of the loan').setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('cancel')
			.setDescription('Cancel a pending loan in the registry.')
			.addStringOption((option) => option.setName('loanid').setDescription('Specify a loan').setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('accept')
			.setDescription('Accept a pending loan in the registry')
			.addStringOption((option) => option.setName('loanid').setDescription('Specify a loan').setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('decline')
			.setDescription('Decline a pending loan in the registry')
			.addStringOption((option) => option.setName('loanid').setDescription('Specify a loan').setRequired(true)))
		.addSubcommandGroup((subcommandgroup) => subcommandgroup
			.setName('delete')
			.setDescription('Delete loan data')
			.setAuthority('MANAGER')
			.addSubcommand((subcommand) => subcommand.setName('single').setDescription('Delete a single loan').addStringOption((option) => option.setName('loanid').setDescription('Specify a loan').setRequired(true)))
			.addSubcommand((subcommand) => subcommand.setName('user').setDescription('Delete all pending loans for a user').addUserOption((option) => option.setName('lender').setDescription('Specify a user')).addUserOption((option) => option.setName('borrower').setDescription('Specify a user')))
			.addSubcommand((subcommand) => subcommand.setName('all').setDescription('Delete all loans')));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();
		const principal = ctx.interaction.options.getInteger('principal', false);
		const repayment = ctx.interaction.options.getInteger('repayment', false);
		const duration = ctx.interaction.options.getString('duration', false);
		const user = ctx.interaction.options.getUser('user', false);
		const lender = ctx.interaction.options.getUser('lender', false);
		const borrower = ctx.interaction.options.getUser('borrower', false);
		const { valid, document } = await validateObjectId(ctx, 'Loan');
		if (!valid) return;
		const targetDocument = user
			?? (await MemberModel.findOneAndUpdate(
				{ guild: ctx.guildDocument, userId: user.id },
				{ guild: ctx.guildDocument, userId: user.id },
				{ upsert: true, new: true, setDefaultsOnInsert: true },
			));
		const { id } = document;
		const { currency } = ctx.guildDocument;
		const { treasury } = await getEconInfo(ctx.memberDocument);
		if (subcommand === 'propose') {
			if (user.id === ctx.interaction.user.id) {
				await ctx.embedify('error', 'user', 'You cannot give yourself a loan.', true);
			} else if (principal > treasury) {
				await ctx.embedify('error', 'user', 'Please enter a smaller amount.', true);
			} else if (principal < 1) {
				await ctx.embedify('error', 'user', 'Principal cannot be less than 1.', true);
			} else if (!ms(duration)) {
				await ctx.embedify('error', 'user', 'Please enter a valid length.', true);
			} else {
				const loan = await LoanModel.create({
					guild: ctx.guildDocument,
					borrower: targetDocument,
					lender: ctx.memberDocument,
					principal,
					repayment,
					expires: new Date(new Date().getTime() + ms(duration)),
					pending: true,
					active: true,
					complete: false,
				});
				await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'LOAN_PROPOSE', 0, -principal);
				const content = `Successfully created a loan.
				Loan \`${loan.id}\` | <t:${loan.createdAt.getTime()}:f>
				Expires in <t:${loan.expires.getTime()}:R>
				Borrower: <@!${loan.populate('member')}>
				Pending: \`${loan.pending}\` | Active: \`${loan.active}\` | Complete: \`${loan.complete}\`
				Principal: ${currency}${loan.principal.toLocaleString()} | Repayment: ${currency}${loan.repayment.toLocaleString()}`;
				await ctx.embedify('success', 'user', content, false);
			}
		} if (subcommand === 'cancel') {
			await LoanModel.findOneAndUpdate(
				{ id, guildId: ctx.interaction.guild.id, lenderId: ctx.interaction.user.id, pending: false },
				{ pending: false, active: false },
			);
			await ctx.embedify('error', 'user', `Canceled loan \`${id}\``, false);
		} if (subcommand === 'accept') {
			const loan = await LoanModel.findOneAndUpdate(
				{ id, guildId: ctx.interaction.guild.id, borrowerId: ctx.interaction.user.id, pending: true },
				{ pending: false },
			);
			const { lender } = await loan.populate('lender');
			transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, lender, 'LOAN_ACCEPT', loan.principal, 0);
			await ctx.embedify('success', 'user', `Accepted loan \`${id}\``, false);
		} if (subcommand === 'decline') {
			const loan = await LoanModel.findOneAndUpdate(
				{ id, guildId: ctx.interaction.guild.id, borrowerId: ctx.interaction.user.id, pending: true },
				{ pending: false, active: false },
			);
			const { lender } = await loan.populate('lender');
			transaction(ctx.client, ctx.guildDocument, lender, ctx.clientDocument, 'LOAN_DECLINE', 0, loan.principal);
			await ctx.embedify('success', 'user', `Accepted loan \`${id}\``, false);
		} if (subcommand === 'view') {
			if (id) {
				const { borrower } = await document.populate('borrower');
				await ctx.embedify(
					'success',
					'user',
					`Loan \`${id}\` | <t:${document.createdAt.getMilliseconds()}:f>
					Expires in <t:${document.expires.getMilliseconds()}:R>
					Borrower: <@!${borrower.userId}>
					Pending: \`${document.pending}\` | Active: \`${document.active}\` | Complete: \`${document.complete}\`
					Principal: ${currency}${document.principal} | Repayment: ${currency}${document.repayment})`,
					false,
				);
			} else if (user) {
				const outgoingLoans = await LoanModel.find({ guildId: ctx.guildDocument.guildId, lenderId: user.id });
				const incomingLoans = await LoanModel.find({ guildId: ctx.guildDocument.guildId, borrowerId: user.id });
				let description = '';
				outgoingLoans.forEach(async (loan) => {
					await loan.populate('borrower');
					description
						+= `Outgoing Loan \`${loan.id}\`
						Expires in <t:${loan.expires.getMilliseconds()}:R>
						Borrower: <@!${loan.borrower.userId}>
						Pending: \`${loan.pending}\` | Active: \`${loan.active}\` | Complete: \`${loan.complete}\`
						Principal: ${currency}${loan.principal} | Repayment: ${currency}${loan.repayment}\n\n`;
				});
				incomingLoans.forEach(async (loan) => {
					await loan.populate('lender');
					description
						+= `Incoming Loan \`${loan.id}\`
						Expires in <t:${loan.expires.getMilliseconds()}:R>
						Lender: <@!${loan.lender.userId}>
						Pending: \`${loan.pending}\` | Active: \`${loan.active}\` | Complete: \`${loan.complete}\`
						Principal: ${currency}${loan.principal} | Repayment: ${currency}${loan.repayment}\n\n`;
				});
				await ctx.embedify('success', 'user', description ?? 'No loans found.', !!description);
			}
		} else if (subcommandgroup === 'delete') {
			if (subcommand === 'id') {
				await document.deleteOne();
				await ctx.embedify('success', 'user', `Deleted loan \`${id}\``, true);
			} else if (subcommand === 'user') {
				const loans = lender
					? await LoanModel.deleteMany({
						guildId: ctx.guildDocument.guildId,
						lender,
					})
					: await LoanModel.deleteMany({
						guildId: ctx.guildDocument.guildId,
						borrower,
					});
				await ctx.embedify('success', 'user', `Deleted \`${loans.deletedCount}\` loans.`, true);
			} else if (subcommand === 'all') {
				const loans = await LoanModel.deleteMany({ guildId: ctx.interaction.guild.id });
				await ctx.embedify('success', 'user', `Deleted \`${loans.deletedCount}\` loans.`, true);
			}
		}
	};
}
