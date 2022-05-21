import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { Util } from 'discord.js';
import ms from 'ms';

import { Loan, Member, User } from '../../entities/index.js';
import { recordTransaction } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis } from '../../typings/constants.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('loan')
		.setDescription('Loan money to other users')
		.setModule('ECONOMY')
		.setFormat('loan <view | propose | cancel | accept> [...options]')
		.setExamples([
			'loan propose @Economica 100 200 1d',
			'loan cancel 972302967296233478',
			'loan accept 972302967296233478',
		])
		.addSubcommand((subcommand) => subcommand
			.setName('view')
			.setDescription('View a loan')
			.addStringOption((option) => option.setName('loan_id').setDescription('Specify a loan Id')))
		.addSubcommand((subcommand) => subcommand
			.setName('propose')
			.setDescription('Propose a loan')
			.addUserOption((option) => option.setName('borrower').setDescription('Specify a borrower').setRequired(true))
			.addStringOption((option) => option.setName('principal').setDescription('Specify the initial payment of the loan').setRequired(true))
			.addStringOption((option) => option.setName('repayment').setDescription('Specify the loan\'s repayment').setRequired(true))
			.addStringOption((option) => option.setName('duration').setDescription('Specify the duration of the loan').setRequired(true))
			.addStringOption((option) => option.setName('message').setDescription('Specify a message')))
		.addSubcommand((subcommand) => subcommand
			.setName('cancel')
			.setDescription('Cancel a pending loan')
			.addStringOption((option) => option.setName('loan_id').setDescription('Specify a loan Id').setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('accept')
			.setDescription('Accept a pending loan')
			.addStringOption((option) => option.setName('loan_id').setDescription('Specify a loan Id').setRequired(true)));

	public execute = async (ctx: Context): Promise<void> => {
		const subcommand = ctx.interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const loanId = ctx.interaction.options.getString('loan_id', false);
			if (loanId) {
				const loan = await Loan.findOneBy({ id: loanId, guild: { id: ctx.interaction.guildId } });
				if (!loan) {
					await ctx.embedify('error', 'user', `Could not find loan with id \`${loanId}\``).send();
					return;
				}

				const loanEmbed = ctx
					.embedify('info', 'user', `**Created At**: \`${loan.createdAt.toLocaleString()}\`\n**Completed At**: \`${loan.completedAt?.toLocaleString()}\``)
					.setAuthor({ name: `Loan ${loan.id}`, iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.MONEY_BAG).id)?.url })
					.addFields([
						{ name: '🤵‍♂️ Lender', value: `<@!${loan.lender.userId}>`, inline: true },
						{ name: `${Emojis.PERSON_ADD} Borrower`, value: `<@!${loan.borrower?.userId}>`, inline: true },
						{ name: `${Emojis.DEED} Message`, value: `*${loan.message}*` },
						{ name: `${Emojis.ECON_DOLLAR} Principal`, value: `${ctx.guildEntity.currency}${parseNumber(loan.principal)}`, inline: true },
						{ name: `${Emojis.CREDIT} Repayment`, value: `${ctx.guildEntity.currency}${parseNumber(loan.repayment)}`, inline: true },
						{ name: `${Emojis.TIME} Duration`, value: `\`${ms(loan.duration, { long: true })}\``, inline: true },
					]);

				await ctx.interaction.reply({ embeds: [loanEmbed] });
			} else {
				const loans = await Loan.findBy({ guild: { id: ctx.interaction.guildId } });
				const outgoingLoans = loans.filter((loan) => loan.lender.userId === ctx.memberEntity.userId);
				const incomingLoans = loans.filter((loan) => loan.borrower.userId === ctx.memberEntity.userId);
				const outgoingPendingLoans = outgoingLoans.filter((loan) => loan.pending);
				const incomingPendingLoans = incomingLoans.filter((loan) => loan.pending);
				const outgoingActiveLoans = outgoingLoans.filter((loan) => loan.active);
				const incomingActiveLoans = incomingLoans.filter((loan) => loan.active);
				const outgoingCompleteLoans = outgoingLoans.filter((loan) => loan.completedAt);
				const incomingCompleteLoans = incomingLoans.filter((loan) => loan.completedAt);
				const loansEmbed = ctx.embedify('info', 'user')
					.setAuthor({ name: 'Loan Management Menu' })
					.setThumbnail(ctx.client.emojis.resolve(Util.parseEmoji(Emojis.DEED).id)?.url)
					.setDescription('Loans may be viewed in detail by using the command `loan view <id>`.')
					.addFields([
						{ name: `${Emojis.MONEY_BAG} Pending Loans`, value: 'Pending loans are loans that have not yet been accepted by the borrower. Loan proposals may be canceled by the lender with the command `loan cancel <id>`.' },
						{ name: '➡️ Outgoing', value: outgoingPendingLoans.map((loan) => `\`${loan.id}\``).join('\n') || 'None', inline: true },
						{ name: '⬅️ Incoming ', value: incomingPendingLoans.map((loan) => `\`${loan.id}\``).join('\n') || 'None', inline: true },
						{ name: `${Emojis.CREDIT} Active Loans`, value: 'Active loans are loans that have been accepted by the borrower and are currently in effect. **Note**: Loans are updated every 5 minutes.' },
						{ name: '➡️ Outgoing', value: outgoingActiveLoans.map((loan) => `\`${loan.id}\``).join('\n') || 'None', inline: true },
						{ name: '⬅️ Incoming ', value: incomingActiveLoans.map((loan) => `\`${loan.id}\``).join('\n') || 'None', inline: true },
						{ name: `${Emojis.CHECK} Complete Loans`, value: 'Complete loans are loans that have been repayed and fully processed.' },
						{ name: '➡️ Outgoing', value: outgoingCompleteLoans.map((loan) => `\`${loan.id}\``).join('\n') || 'None', inline: true },
						{ name: '⬅️ Incoming ', value: incomingCompleteLoans.map((loan) => `\`${loan.id}\``).join('\n') || 'None', inline: true },
					]);

				await ctx.interaction.reply({ embeds: [loansEmbed] });
			}
		} else if (subcommand === 'propose') {
			const borrower = ctx.interaction.options.getMember('borrower');
			const principal = ctx.interaction.options.getString('principal');
			const repayment = ctx.interaction.options.getString('repayment');
			const duration = ctx.interaction.options.getString('duration');
			const message = ctx.interaction.options.getString('message', false) ?? 'No Message';

			// Validate parameters
			if (borrower.id === ctx.client.user.id) await ctx.embedify('error', 'bot', 'You cannot loan to me.').send();
			else if (borrower.user.bot) await ctx.embedify('error', 'user', 'You cannot loan to a bot.').send();
			else if (borrower.id === ctx.interaction.user.id) await ctx.embedify('error', 'user', 'You cannot loan to yourself.').send();
			else if (!parseString(principal)) await ctx.embedify('error', 'user', `Could not parse principal \`${principal}\`.`).send();
			else if (parseString(principal) > ctx.memberEntity.wallet) await ctx.embedify('error', 'user', `You cannot afford that loan principal. Your current wallet balance is ${ctx.guildEntity.currency}${ctx.memberEntity.wallet}.`).send();
			else if (!parseString(repayment)) await ctx.embedify('error', 'user', `Could not parse repayment \`${repayment}\`.`).send();
			else if (!ms(duration)) await ctx.embedify('error', 'user', `Could not parse duration \`${duration}\`.`).send();
			if (ctx.interaction.replied) return;

			// Create borrower if not exist
			await User.upsert({ id: borrower.id }, ['id']);
			await Member.upsert({ userId: borrower.id, guildId: borrower.guild.id }, ['userId', 'guildId']);
			const borrowerEntity = await Member.findOneBy({ userId: borrower.id, guildId: borrower.guild.id });

			const loan = await Loan.create({
				guild: ctx.guildEntity,
				lender: ctx.memberEntity,
				borrower: borrowerEntity,
				principal: parseString(principal),
				repayment: parseString(repayment),
				message,
				duration: ms(duration),
				pending: true,
				active: false,
			}).save();

			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_PROPOSE', -loan.principal, 0);
			await ctx.embedify('success', 'user', `${Emojis.DEED} **Loan Created Successfully**`).send();
		} else if (subcommand === 'cancel') {
			const loanId = ctx.interaction.options.getString('loan_id', false);
			const loan = await Loan.findOneBy({ id: loanId, lender: { userId: ctx.interaction.user.id }, guild: { id: ctx.interaction.guildId } });
			if (!loan) {
				await ctx.embedify('error', 'user', `Could not find loan with id \`${loanId}\``).send();
				return;
			}

			loan.pending = false;
			await loan.save();
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_CANCEL', loan.principal, 0);
			await ctx.embedify('success', 'user', `${Emojis.CROSS} **Loan Canceled**`).send();
		} else if (subcommand === 'accept') {
			const loanId = ctx.interaction.options.getString('loan_id', false);
			const loan = await Loan.findOneBy({ id: loanId, borrower: { userId: ctx.interaction.user.id }, guild: { id: ctx.interaction.guildId } });
			if (!loan) {
				await ctx.embedify('error', 'user', `Could not find loan with id \`${loanId}\``).send();
				return;
			}

			loan.pending = false;
			loan.active = true;
			await loan.save();
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_ACCEPT', loan.principal, 0);
			await ctx.embedify('success', 'user', `${Emojis.CHECK} **Loan Accepted**`).send();
		}
	};
}
