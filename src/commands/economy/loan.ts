import ms from 'ms';

import { getEconInfo, transaction } from '../../lib';
import { validateObjectId } from '../../lib/validate';
import { LoanModel, Member, MemberModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('loan')
		.setDescription('Loan money to other users.')
		.setModule('ECONOMY')
		.setFormat('<propose | cancel | accept | decline | view> [...options]')
		.setExamples([
			'loan propose @Wumpus 1000 1200 2d',
			'loan cancel 61199fcedfa37a179c65c37b',
			'loan accept 61199fcedfa37a179c65c37b',
			'loan decline 61199fcedfa37a179c65c37b',
			'loan view 61199fcedfa37a179c65c37b',
			'loan view @Wumpus',
		])
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('propose')
				.setDescription('Add a loan to the registry.')
				.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
				.addIntegerOption((option) =>
					option.setName('principal').setDescription('Specify the principal.').setMinValue(1).setRequired(true)
				)
				.addIntegerOption((option) =>
					option.setName('repayment').setDescription('Specify the repayment.').setMinValue(1).setRequired(true)
				)
				.addStringOption((option) =>
					option.setName('duration').setDescription('Specify the life of the loan.').setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('cancel')
				.setDescription('Cancel a pending loan in the registry.')
				.addStringOption((option) => option.setName('loan_id').setDescription('Specify a loan.').setRequired(true))
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('accept')
				.setDescription('Accept a pending loan in the registry.')
				.addStringOption((option) => option.setName('loan_id').setDescription('Specify a loan.').setRequired(true))
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('decline')
				.setDescription('Decline a pending loan in the registry.')
				.addStringOption((option) => option.setName('loan_id').setDescription('Specify a loan.').setRequired(true))
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('view')
				.setDescription('View the loan registry.')
				.addStringOption((option) => option.setName('loan_id').setDescription('Specify a loan.'))
				.addUserOption((option) => option.setName('user').setDescription('Specify a user.'))
		)
		.addEconomicaSubcommandGroup((subcommandgroup) =>
			subcommandgroup
				.setName('delete')
				.setDescription('Delete loan data.')
				.setAuthority('MANAGER')
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('id')
						.setDescription('Delete a single loan.')
						.addStringOption((option) => option.setName('loan_id').setDescription('Specify a loan.').setRequired(true))
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('user')
						.setDescription('Delete all pending loans for a user.')
						.addUserOption((option) => option.setName('lender').setDescription('Specify a user.'))
						.addUserOption((option) => option.setName('borrower').setDescription('Specify a user.'))
				)
				.addEconomicaSubcommand((subcommand) => subcommand.setName('all').setDescription('Delete all loans.'))
		);

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

		const targetDocument =
			user ??
			(await MemberModel.findOneAndUpdate(
				{ guild: ctx.guildDocument, userId: user.id },
				{ guild: ctx.guildDocument, userId: user.id },
				{ upsert: true, new: true, setDefaultsOnInsert: true }
			));

		const { _id } = document;
		const { currency } = ctx.guildDocument;
		const { treasury } = await getEconInfo(ctx.memberDocument);

		if (subcommand === 'propose') {
			// prettier-ignore
			if (user.id === ctx.interaction.user.id) return await ctx.embedify('error', 'user', 'You cannot give yourself a loan.', true);
			if (principal > treasury) return await ctx.embedify('error', 'user', 'Please enter a smaller amount.', true);
			if (principal < 1) return await ctx.embedify('error', 'user', 'Principal cannot be less than 1.', true);
			if (!ms(duration)) return await ctx.embedify('error', 'user', 'Please enter a valid length.', true);

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

			await transaction(
				ctx.client,
				ctx.guildDocument,
				ctx.memberDocument,
				ctx.clientDocument,
				'LOAN_PROPOSE',
				0,
				-principal
			);

			// prettier-ignore
			const content = `Successfully created a loan.
			Loan \`${loan._id}\` | <t:${loan.createdAt.getTime()}:f>
			Expires in <t:${loan.expires.getTime()}:R>
			Borrower: <@!${loan.populate('member')}>
			Pending: \`${loan.pending}\` | Active: \`${loan.active}\` | Complete: \`${loan.complete}\`
			Principal: ${currency}${loan.principal.toLocaleString()} | Repayment: ${currency}${loan.repayment.toLocaleString()}`;
			return await ctx.embedify('success', 'user', content, false);
		} else if (subcommand === 'cancel') {
			await LoanModel.findOneAndUpdate(
				{
					_id,
					guildId: ctx.interaction.guild.id,
					lenderId: ctx.interaction.user.id,
					pending: false,
				},
				{
					pending: false,
					active: false,
				}
			);

			return await ctx.embedify('error', 'user', `Canceled loan \`${_id}\``, false);
		} else if (subcommand === 'accept') {
			const loan = await LoanModel.findOneAndUpdate(
				{
					_id,
					guildId: ctx.interaction.guild.id,
					borrowerId: ctx.interaction.user.id,
					pending: true,
				},
				{
					pending: false,
				}
			);

			const lender = loan.populate('lender').lender as Member;
			transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, lender, 'LOAN_ACCEPT', loan.principal, 0);
			return await ctx.embedify('success', 'user', `Accepted loan \`${_id}\``, false);
		} else if (subcommand === 'decline') {
			const loan = await LoanModel.findOneAndUpdate(
				{
					_id,
					guildId: ctx.interaction.guild.id,
					borrowerId: ctx.interaction.user.id,
					pending: true,
				},
				{
					pending: false,
					active: false,
				}
			);

			const lender = loan.populate('lender').lender as Member;
			transaction(ctx.client, ctx.guildDocument, lender, ctx.clientDocument, 'LOAN_DECLINE', 0, loan.principal);
			return await ctx.embedify('success', 'user', `Accepted loan \`${_id}\``, false);
		} else if (subcommand === 'view') {
			if (_id) {
				// prettier-ignore
				const borrower = document.populate('borrower').borrower as Member
				return await ctx.embedify(
					'success',
					'user',
					`Loan \`${_id}\` | <t:${document.createdAt.getMilliseconds()}:f>
					Expires in <t:${document.expires.getMilliseconds()}:R>
					Borrower: <@!${borrower.userId}>
					Pending: \`${document.pending}\` | Active: \`${document.active}\` | Complete: \`${document.complete}\`
					Principal: ${currency}${document.principal} | Repayment: ${currency}${document.repayment})`,
					false
				);
			} else if (user) {
				const outgoingLoans = await LoanModel.find({
					guildId: ctx.guildDocument.guildId,
					lenderId: user.id,
				});
				const incomingLoans = await LoanModel.find({
					guildId: ctx.guildDocument.guildId,
					borrowerId: user.id,
				});
				let description = '';

				outgoingLoans.forEach((loan) => {
					loan.populate('borrower');
					const borrower = loan.borrower as Member;
					// prettier-ignore
					description += 
						`Outgoing Loan \`${loan._id}\`
						Expires in <t:${loan.expires.getMilliseconds()}:R>
						Borrower: <@!${borrower.userId}>
						Pending: \`${loan.pending}\` | Active: \`${loan.active}\` | Complete: \`${loan.complete}\`
						Principal: ${currency}${loan.principal} | Repayment: ${currency}${loan.repayment}\n\n`;
				});

				incomingLoans.forEach((loan) => {
					loan.populate('lender');
					const lender = loan.lender as Member;
					//prettier-ignore
					description += 
						`Incoming Loan \`${loan._id}\`
						Expires in <t:${loan.expires.getMilliseconds()}:R>
						Lender: <@!${lender.userId}>
						Pending: \`${loan.pending}\` | Active: \`${loan.active}\` | Complete: \`${loan.complete}\`
						Principal: ${currency}${loan.principal} | Repayment: ${currency}${loan.repayment}\n\n`;
				});

				return await ctx.embedify('success', 'user', description ?? 'No loans found.', description ? true : false);
			}
		} else if (subcommandgroup === 'delete') {
			let description;
			if (subcommand === 'id') {
				await document.deleteOne();
				description = `Deleted loan \`${_id}\``;
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
				description = `Deleted \`${loans.deletedCount}\` loans.`;
			} else if (subcommand === 'all') {
				const loans = await LoanModel.deleteMany({ guildId: ctx.interaction.guild.id });
				description = `Deleted \`${loans.deletedCount}\` loans.`;
			}

			return await ctx.embedify('success', 'user', description, true);
		}
	};
}
