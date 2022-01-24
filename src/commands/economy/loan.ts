import ms from 'ms';
import { isValidObjectId } from 'mongoose';
import { MessageEmbed } from 'discord.js';
import { LoanModel } from '../../models';
import {
	Context,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	PermissionRole,
	TransactionTypes,
	BalanceTypes,
} from '../../structures';
import { getEconInfo, transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('loan')
		.setDescription('Loan money to other users.')
		.setGroup('economy')
		.setFormat('<propose | cancel | accept | decline | view> [...options]')
		.setExamples([
			'loan propose @Wumpus 1000 1200 2d',
			'loan cancel 61199fcedfa37a179c65c37b',
			'loan accept 61199fcedfa37a179c65c37b',
			'loan decline 61199fcedfa37a179c65c37b',
			'loan view 61199fcedfa37a179c65c37b',
			'loan view @Wumpus',
		])
		.setGlobal(false)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('propose')
				.setDescription('Add a loan to the registry.')
				.addUserOption((option) =>
					option.setName('user').setDescription('Specify a user').setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('principal')
						.setDescription('Specify the principal.')
						.setMinValue(1)
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName('repayment')
						.setDescription('Specify the repayment.')
						.setMinValue(1)
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('duration')
						.setDescription('Specify the life of the loan.')
						.setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('cancel')
				.setDescription('Cancel a pending loan in the registry.')
				.addStringOption((option) =>
					option.setName('loan_id').setDescription('Specify a loan.').setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('accept')
				.setDescription('Accept a pending loan in the registry.')
				.addStringOption((option) =>
					option.setName('loan_id').setDescription('Specify a loan.').setRequired(true)
				)
		)
		.addEconomicaSubcommand((subcommand) =>
			subcommand
				.setName('decline')
				.setDescription('Decline a pending loan in the registry.')
				.addStringOption((option) =>
					option.setName('loan_id').setDescription('Specify a loan.').setRequired(true)
				)
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
				.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('id')
						.setDescription('Delete a single loan.')
						.addStringOption((option) =>
							option.setName('loan_id').setDescription('Specify a loan.').setRequired(true)
						)
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand
						.setName('user')
						.setDescription('Delete all pending loans for a user.')
						.addUserOption((option) => option.setName('lender').setDescription('Specify a user.'))
						.addUserOption((option) => option.setName('borrower').setDescription('Specify a user.'))
				)
				.addEconomicaSubcommand((subcommand) =>
					subcommand.setName('all').setDescription('Delete all loans.')
				)
		);

	execute = async (ctx: Context) => {
		const subcommandgroup = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand();
		const { currency } = ctx.guildDocument;
		const { wallet, treasury } = await getEconInfo(
			ctx.guildDocument.guildId,
			ctx.interaction.user.id
		);

		if (subcommand === 'propose') {
			const borrower = ctx.interaction.options.getUser('user');
			const principal = ctx.interaction.options.getInteger('principal');
			const repayment = ctx.interaction.options.getInteger('repayment');
			const duration = ctx.interaction.options.getString('duration');

			if (borrower.id === ctx.interaction.user.id) {
				return await ctx.interaction.reply('You cannot give yourself a loan!');
			}

			if (principal > treasury) {
				return await ctx.interaction.reply('Insufficient treasury.');
			}

			if (!ms(duration)) {
				return await ctx.interaction.reply('Invalid length.');
			}

			const loan = await LoanModel.create({
				guildId: ctx.guildDocument.guildId,
				borrowerId: borrower.id,
				lenderId: ctx.interaction.user.id,
				principal,
				repayment,
				expires: new Date(new Date().getTime() + ms(duration)),
				pending: true,
				active: true,
				complete: false,
			});

			await transaction(
				ctx.client,
				ctx.guildDocument.guildId,
				ctx.interaction.user.id,
				ctx.client.user.id,
				TransactionTypes.Loan_Propose,
				0,
				-principal,
				-principal
			);

			return await ctx.interaction.reply(
				`Successfully created a loan.\nLoan \`${
					loan._id
				}\` | <t:${loan.createdAt.getTime()}:f>\nExpires in <t:${loan.expires.getTime()}:R>\nBorrower: <@!${
					loan.borrowerId
				}>\nPending: \`${loan.pending}\` | Active: \`${loan.active}\` | Complete: \`${
					loan.complete
				}\`\nPrincipal: ${currency}${loan.principal} | Repayment: ${currency}${loan.repayment}`
			);
		} else if (subcommand === 'cancel') {
			const _id = ctx.interaction.options.getString('loan_id');
			if (!isValidObjectId(_id)) {
				return await ctx.interaction.reply(`Invalid Id: \`${_id}\``);
			}
			const loan = await LoanModel.findOneAndUpdate(
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
			if (!loan) {
				return await ctx.interaction.reply(`Could not find pending loan with Id \`${_id}\``);
			}
			return await ctx.interaction.reply(`Canceled loan \`${_id}\``);
		} else if (subcommand === 'accept') {
			const _id = ctx.interaction.options.getString('loan_id');
			if (!isValidObjectId(_id)) {
				return await ctx.interaction.reply(`Invalid Id: \`${_id}\``);
			}
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
			if (!loan) {
				return await ctx.interaction.reply(`Could not find pending loan with Id \`${_id}\``);
			}
			await transaction(
				ctx.client,
				ctx.guildDocument.guildId,
				ctx.interaction.user.id,
				loan.lenderId,
				TransactionTypes.Loan_Accept,
				loan.principal,
				0,
				loan.principal
			);
			return await ctx.interaction.reply(`Accepted loan \`${_id}\``);
		} else if (subcommand === 'decline') {
			const _id = ctx.interaction.options.getString('loan_id');
			if (!isValidObjectId(_id)) {
				return await ctx.interaction.reply(`Invalid Id: \`${_id}\``);
			}
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
			if (!loan) {
				return await ctx.interaction.reply(`Could not find pending loan with Id \`${_id}\``);
			}
			await transaction(
				ctx.client,
				ctx.guildDocument.guildId,
				loan.lenderId,
				ctx.client.user.id,
				TransactionTypes.Loan_Decline,
				0,
				loan.principal,
				loan.principal
			);
			return await ctx.interaction.reply(`Accepted loan \`${_id}\``);
		} else if (subcommand === 'view') {
			const _id = ctx.interaction.options.getString('loan_id', false);
			const user = ctx.interaction.options.getUser('user', false);

			if (_id) {
				if (!isValidObjectId(_id)) {
					return await ctx.interaction.reply(`Invalid Id: \`${_id}\``);
				} else {
					const loan = await LoanModel.findOne({ _id, guildId: ctx.guildDocument.guildId });
					if (!loan) {
						return await ctx.interaction.reply(`Could not find pending loan with Id \`${_id}\``);
					}
					return await ctx.interaction.reply(
						`Loan \`${
							loan._id
						}\` | <t:${loan.createdAt.getMilliseconds()}:f>\nExpires in <t:${loan.expires.getMilliseconds()}:R>\nBorrower: <@!${
							loan.borrowerId
						}>\nPending: \`${loan.pending}\` | Active: \`${loan.active}\` | Complete: \`${
							loan.complete
						}\`\nPrincipal: ${currency}${loan.principal} | Repayment: ${currency}${loan.repayment})`
					);
				}
			} else if (user) {
				const embed = new MessageEmbed().setAuthor({
					name: user.username,
					iconURL: user.displayAvatarURL(),
				});

				const outgoingLoans = await LoanModel.find({
					guildId: ctx.guildDocument.guildId,
					lenderId: user.id,
				});
				const incomingLoans = await LoanModel.find({
					guildId: ctx.guildDocument.guildId,
					borrowerId: user.id,
				});
				let description = '';

				for (const outgoingLoan of outgoingLoans) {
					description += `Outgoing Loan \`${
						outgoingLoan._id
					}\`\nExpires in <t:${outgoingLoan.expires.getMilliseconds()}:R>\nBorrower: <@!${
						outgoingLoan.borrowerId
					}>\nPending: \`${outgoingLoan.pending}\` | Active: \`${
						outgoingLoan.active
					}\` | Complete: \`${outgoingLoan.complete}\`\nPrincipal: ${currency}${
						outgoingLoan.principal
					} | Repayment: ${currency}${outgoingLoan.repayment}\n\n`;
				}

				for (const incomingLoan of incomingLoans) {
					description += `Incoming Loan \`${
						incomingLoan._id
					}\`\nExpires in <t:${incomingLoan.expires.getMilliseconds()}:R>\nLender: <@!${
						incomingLoan.lenderId
					}>\nPending: \`${incomingLoan.pending}\` | Active: \`${
						incomingLoan.active
					}\` | Complete: \`${incomingLoan.complete}\`\nPrincipal: ${currency}${
						incomingLoan.principal
					} | Repayment: ${currency}${incomingLoan.repayment}\n\n`;
				}

				if (description.length === 0) {
					description = 'No loans found.';
				}

				embed.setDescription(description);
				return await ctx.interaction.reply({ embeds: [embed] });
			}
		} else if (subcommandgroup === 'delete') {
			if (subcommand === 'id') {
				const _id = ctx.interaction.options.getString('loan_id');
				if (!isValidObjectId(_id)) {
					return await ctx.interaction.reply(`Invalid Id: \`${_id}\``);
				}
				const transaction = await LoanModel.findOneAndDelete({
					_id,
					guildId: ctx.interaction.guild.id,
				});
				if (!transaction) {
					return await ctx.interaction.reply(`Could not find loan with Id \`${_id}\``);
				}
				return await ctx.interaction.reply(`Deleted loan \`${_id}\``);
			} else if (subcommand === 'user') {
				const lender = ctx.interaction.options.getUser('lender', false);
				const borrower = ctx.interaction.options.getUser('borrower', false);
				const loans = lender
					? await LoanModel.deleteMany({
							guildId: ctx.guildDocument.guildId,
							lenderId: lender.id,
					  })
					: await LoanModel.deleteMany({
							guildId: ctx.guildDocument.guildId,
							borrowerId: borrower.id,
					  });
				return await ctx.interaction.reply(`Deleted \`${loans.deletedCount}\` loans.`);
			} else if (subcommand === 'all') {
				const loans = await LoanModel.deleteMany({ guildId: ctx.interaction.guild.id });
				return await ctx.interaction.reply(`Deleted \`${loans.deletedCount}\` loans.`);
			}
		}
	};
}