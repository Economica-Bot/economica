import { Emojis, LoanStatus } from '@economica/common';
import {
	datasource,
	Guild,
	Loan as LoanEntity,
	Member,
	User
} from '@economica/db';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	parseEmoji,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from 'discord.js';
import ms from 'ms';
import { recordTransaction } from '../lib';
import { parseNumber, parseString } from '../lib/economy';
import { Command } from '../structures/commands';
import { PAGINATION_LIMIT } from '../types';

export const Loan = {
	identifier: /^loan$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'manage') {
			const outgoingPendingLoanCount = await datasource
				.getRepository(LoanEntity)
				.countBy({
					guild: { id: interaction.guildId },
					lender: { user: { id: interaction.user.id } },
					status: LoanStatus.PENDING
				});
			const incomingPendingLoanCount = await datasource
				.getRepository(LoanEntity)
				.countBy({
					guild: { id: interaction.guildId },
					borrower: { user: { id: interaction.user.id } },
					status: LoanStatus.PENDING
				});
			const outgoingActiveLoanCount = await datasource
				.getRepository(LoanEntity)
				.countBy({
					guild: { id: interaction.guildId },
					lender: { user: { id: interaction.user.id } },
					status: LoanStatus.ACTIVE
				});
			const incomingActiveLoanCount = await datasource
				.getRepository(LoanEntity)
				.countBy({
					guild: { id: interaction.guildId },
					borrower: { user: { id: interaction.user.id } },
					status: LoanStatus.ACTIVE
				});
			const outgoingCompleteLoanCount = await datasource
				.getRepository(LoanEntity)
				.countBy({
					guild: { id: interaction.guildId },
					lender: { user: { id: interaction.user.id } },
					status: LoanStatus.COMPLETE
				});
			const incomingCompleteLoanCount = await datasource
				.getRepository(LoanEntity)
				.countBy({
					guild: { id: interaction.guildId },
					borrower: { user: { id: interaction.user.id } },
					status: LoanStatus.COMPLETE
				});

			const loansEmbed = new EmbedBuilder()
				.setAuthor({
					name: 'Loan Management Menu',
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					iconURL: interaction.client.emojis.resolve(
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						parseEmoji(Emojis.DEED)!.id!
					)!.url
				})
				.setDescription('Loans are cased by their status.')
				.addFields([
					{
						name: `${Emojis.MONEY_BAG} Pending Loans`,
						value:
							'Pending loans are loans that have not yet been accepted by the borrower. Loan proposals may be canceled by the lender with the command `loan cancel <id>`.'
					},
					{
						name: '➡️ Outgoing',
						value: `You have \`${outgoingPendingLoanCount}\` outgoing pending loans`,
						inline: true
					},
					{
						name: '⬅️ Incoming ',
						value: `You have \`${incomingPendingLoanCount}\` incoming pending loans`,
						inline: true
					},
					{
						name: `${Emojis.CREDIT} Active Loans`,
						value:
							'Active loans are loans that have been accepted by the borrower and are currently in effect. **Note**: Loans are updated every 5 minutes.'
					},
					{
						name: '➡️ Outgoing',
						value: `You have \`${outgoingActiveLoanCount}\` outgoing active loans`,
						inline: true
					},
					{
						name: '⬅️ Incoming ',
						value: `You have \`${incomingActiveLoanCount}\` incoming active loans`,
						inline: true
					},
					{
						name: `${Emojis.CHECK} Complete Loans`,
						value:
							'Complete loans are loans that have been repayed and fully processed.'
					},
					{
						name: '➡️ Outgoing',
						value: `You have \`${outgoingCompleteLoanCount}\` incoming complete loans`,
						inline: true
					},
					{
						name: '⬅️ Incoming ',
						value: `You have \`${incomingCompleteLoanCount}\` incoming complete loans`,
						inline: true
					}
				]);

			const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
				new StringSelectMenuBuilder()
					.setCustomId(`loan_view:${interaction.user.id}`)
					.setOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel('Pending')
							.setValue(`loan_view_PENDING_1`),
						new StringSelectMenuOptionBuilder()
							.setLabel('Active')
							.setValue(`loan_view_ACTIVE_1`),
						new StringSelectMenuOptionBuilder()
							.setLabel('Complete')
							.setValue(`loan_view_COMPLETE_1`)
					)
			);

			await interaction.reply({ embeds: [loansEmbed], components: [row] });
		} else if (subcommand === 'propose') {
			const borrower = interaction.options.getUser('borrower', true);
			const principal = interaction.options.getString('principal', true);
			const repayment = interaction.options.getString('repayment', true);
			const duration = interaction.options.getString('duration', true);
			const message = interaction.options.getString('message') ?? 'No Message';

			const memberEntity = await datasource
				.getRepository(Member)
				.findOneByOrFail({
					userId: interaction.user.id,
					guildId: interaction.guildId
				});

			// Validate parameters
			if (borrower.id === interaction.client.user.id)
				throw new Error('You cannot loan to me.');
			else if (borrower.bot) throw new Error('You cannot loan to a bot.');
			else if (borrower.id === interaction.user.id)
				throw new Error('You cannot loan to yourself.');
			else if (!parseString(principal))
				throw new Error(`Could not parse principal \`${principal}\`.`);
			else if (parseString(principal) > memberEntity.wallet)
				throw new Error(
					`You cannot afford that loan principal. Your current wallet balance is ${guildEntity.currency} \`${memberEntity.wallet}\`.`
				);
			else if (!parseString(repayment))
				throw new Error(`Could not parse repayment \`${repayment}\`.`);
			else if (!ms(duration))
				throw new Error(`Could not parse duration \`${duration}\`.`);

			// Create borrower if not exist
			await datasource.getRepository(User).save({ id: borrower.id });
			await datasource.getRepository(Member).save({
				userId: borrower.id,
				guildId: interaction.guildId
			});
			const loan = await datasource.getRepository(LoanEntity).save({
				guild: { id: interaction.guildId },
				lender: { userId: interaction.user.id, guildId: interaction.guildId },
				borrower: { userId: borrower.id, guildId: interaction.guildId },
				principal: parseString(principal),
				repayment: parseString(repayment),
				message,
				duration: ms(duration),
				status: LoanStatus.CANCELED
			});

			await recordTransaction(
				interaction.guildId,
				interaction.user.id,
				interaction.client.user.id,
				'LOAN_PROPOSE',
				-loan.principal,
				0
			);

			const embed = new EmbedBuilder()
				.setTitle('Loan Proposal')
				.setDescription('Proposing a loan!')
				.setFields([
					{
						name: '🤵‍♂️ Lender',
						value: `<@!${loan.lender.userId}>`,
						inline: true
					},
					{
						name: `${Emojis.PERSON_ADD} Borrower`,
						value: `<@!${loan.borrower.userId}>`,
						inline: true
					},
					{
						name: `${Emojis.DEED} Message`,
						value: `*${loan.message}*`
					},
					{
						name: `${Emojis.ECON_DOLLAR} Principal`,
						value: `${guildEntity.currency} \`${parseNumber(
							loan.principal ?? 0
						)}\``,
						inline: true
					},
					{
						name: `${Emojis.CREDIT} Repayment`,
						value: `${guildEntity.currency} \`${parseNumber(
							loan.repayment ?? 0
						)}\``,
						inline: true
					},
					{
						name: `${Emojis.TIME} Duration`,
						value: `\`${ms(loan.duration ?? 0, { long: true })}\``
					}
				]);

			const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
				new ButtonBuilder()
					.setCustomId(`loan_cancel:${interaction.user.id}:${loan.id}`)
					.setLabel('Cancel')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId(`loan_create:${interaction.user.id}:${loan.id}`)
					.setLabel('Create')
					.setStyle(ButtonStyle.Success)
			]);

			await interaction.reply({ embeds: [embed], components: [row] });
		}
	}
} satisfies Command<'chatInput'>;

export const LoanCancel = {
	identifier: /^loan_cancel:(?<userId>(.*)):(?<loanId>(.*))$/,
	type: 'button',
	execute: async (interaction, args) => {
		const loan = await datasource
			.getRepository(LoanEntity)
			.findOneByOrFail({ id: args.groups.loanId });
		await recordTransaction(
			interaction.guildId,
			interaction.user.id,
			interaction.client.user.id,
			'LOAN_CANCEL',
			0,
			loan.principal
		);
		await datasource.getRepository(LoanEntity).remove(loan);
		const embed = new EmbedBuilder().setDescription(
			`${Emojis.CROSS} **Loan Proposal Cancelled**`
		);
		await interaction.update({ embeds: [embed], components: [] });
	}
} satisfies Command<'button', 'userId' | 'loanId'>;

export const LoanCreate = {
	identifier: /^loan_create:(?<userId>(.*)):(?<loanId>(.*))$/,
	type: 'button',
	execute: async (interaction, args) => {
		await datasource.getRepository(LoanEntity).update(
			{
				id: args.groups.loanId
			},
			{ status: LoanStatus.PENDING }
		);
		const embed = new EmbedBuilder().setDescription(
			`${Emojis.DEED} **Loan Proposal Created**`
		);
		await interaction.update({ embeds: [embed], components: [] });
	}
} satisfies Command<'button', 'userId' | 'loanId'>;

export const LoanAccept = {
	identifier: /^loan_accept:(?<userId>(.*)):(?<loanId>(.*))$/,
	type: 'button',
	execute: async (interaction, args) => {
		const loan = await datasource.getRepository(LoanEntity).findOneByOrFail({
			id: args.groups.loanId
		});
		await recordTransaction(
			interaction.guildId,
			interaction.user.id,
			interaction.client.user.id,
			'LOAN_ACCEPT',
			loan.principal,
			0
		);
		await datasource
			.getRepository(LoanEntity)
			.update({ id: args.groups.loanId }, { status: LoanStatus.ACTIVE });
		const embed = new EmbedBuilder().setDescription(
			`${Emojis.CHECK} **Loan Accepted**`
		);
		await interaction.update({ embeds: [embed], components: [] });
	}
} satisfies Command<'button', 'userId' | 'loanId'>;

export const LoanViewType = {
	identifier: /^loan_view_(?<status>(.*))_(?<page>\d)$/,
	type: 'selectMenu',
	execute: async (interaction, args) => {
		const status = LoanStatus[args.groups.status as keyof typeof LoanStatus];
		const page = +args.groups.page;

		const loans = await datasource.getRepository(LoanEntity).find({
			take: PAGINATION_LIMIT,
			skip: (page - 1) * PAGINATION_LIMIT,
			where: {
				guild: { id: interaction.guildId },
				lender: { user: { id: interaction.user.id } },
				borrower: { user: { id: interaction.user.id } },
				status
			}
		});

		const embed = new EmbedBuilder()
			.setTitle(`Viewing ${LoanStatus[status].toLowerCase()} Loans`)
			.setDescription(
				`There are \`${loans.length}\` ${LoanStatus[
					status
				].toLowerCase()} loans.`
			)
			.setFields(
				loans.map((loan) => ({
					name: `Loan ${loan.id}`,
					value: `>>> **Created At**: \`${loan.createdAt.toLocaleString()}\`\n**Completed At**: \`${
						loan.completedAt ? loan.completedAt.toLocaleString() : 'N/A'
					}\``
				}))
			);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
			new StringSelectMenuBuilder()
				.setCustomId(`loan_view_type:${interaction.user.id}`)
				.setPlaceholder('Select a loan')
				.setOptions(
					loans.map((loan) =>
						new StringSelectMenuOptionBuilder()
							.setValue(`loan_view_single_${loan.id}`)
							.setLabel(`Loan ${loan.id}`)
					)
				)
		);

		await interaction.update({
			embeds: [embed],
			components: row.components[0].options.length ? [row] : []
		});
	}
} satisfies Command<'selectMenu', 'status' | 'page'>;

export const LoanViewSingle = {
	identifier: /^loan_view_single_(?<loanId>(.*))$/,
	type: 'selectMenu',
	execute: async (interaction, args) => {
		const loan = await datasource
			.getRepository(LoanEntity)
			.findOneByOrFail({ id: args.groups.loanId });
		const embed = new EmbedBuilder()
			.setTitle(`Loan ${loan.id}`)
			.setDescription(
				`>>> **Created At**: \`${loan.createdAt.toLocaleString()}\`\n**Completed At**: \`${
					loan.completedAt ? loan.completedAt.toLocaleString() : 'N/A'
				}\``
			)
			.setFields(
				{
					name: '🤵‍♂️ Lender',
					value: `<@!${loan.lender.userId}>`,
					inline: true
				},
				{
					name: `${Emojis.PERSON_ADD} Borrower`,
					value: `<@!${loan.borrower.userId}>`,
					inline: true
				},
				{
					name: `${Emojis.DEED} Message`,
					value: `*${loan.message}*`
				},
				{
					name: `${Emojis.ECON_DOLLAR} Principal`,
					value: `${loan.guild.currency} \`${parseNumber(
						loan.principal ?? 0
					)}\``,
					inline: true
				},
				{
					name: `${Emojis.CREDIT} Repayment`,
					value: `${loan.guild.currency} \`${parseNumber(
						loan.repayment ?? 0
					)}\``,
					inline: true
				},
				{
					name: `${Emojis.TIME} Duration`,
					value: `\`${ms(loan.duration ?? 0, { long: true })}\``
				}
			);

		const row = new ActionRowBuilder<ButtonBuilder>();
		if (
			loan.status === LoanStatus.PENDING &&
			loan.borrower.userId === interaction.user.id
		) {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId(`loan_accept:${interaction.user.id}:${loan.id}`)
					.setStyle(ButtonStyle.Success)
					.setLabel('Accept')
			);
		} else if (
			loan.status === LoanStatus.PENDING &&
			loan.lender.userId === interaction.user.id
		) {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId(`loan_cancel:${interaction.user.id}:${loan.id}`)
					.setStyle(ButtonStyle.Danger)
					.setLabel('Cancel')
			);
		}

		await interaction.update({
			embeds: [embed],
			components: row.components.length ? [row] : []
		});
	}
} satisfies Command<'selectMenu', 'loanId'>;
