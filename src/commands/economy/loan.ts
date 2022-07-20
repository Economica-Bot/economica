import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, parseEmoji } from 'discord.js';
import ms from 'ms';
import { IsNull, Not } from 'typeorm';

import { Loan, Member, User } from '../../entities';
import { displayLoan, recordTransaction } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('loan')
		.setDescription('Take out loans with other members')
		.setModule('ECONOMY')
		.setFormat('loan')
		.setExamples(['loan']);

	public execute = new ExecutionBuilder()
		.setName('Loan')
		.setValue('loan')
		.setDescription('Take out loans with other members')
		.setOptions([
			new ExecutionBuilder()
				.setName('View')
				.setValue('view')
				.setDescription('View active, pending, and past loans')
				.setOptions([
					new ExecutionBuilder()
						.setName('Active')
						.setValue('active')
						.setDescription('View active loans')
						.setPagination(
							async (ctx) => Loan.find({
								relations: ['guild', 'lender', 'borrower'],
								where: [
									{ lender: { userId: ctx.interaction.user.id }, active: true },
									{ borrower: { userId: ctx.interaction.user.id }, active: true }],
							}),
							(loan) => new ExecutionBuilder()
								.setName(`Loan ${loan.id}`)
								.setValue(loan.id)
								.setDescription(`**Created At**: \`${loan.createdAt.toLocaleString()}\`\n**Completed At**: \`${loan.completedAt?.toLocaleString() || 'N/A'}\``)
								.setExecution(async (ctx, interaction) => {
									const embed = displayLoan(loan);
									interaction.reply({ embeds: [embed], components: [] });
								}),
						),
					new ExecutionBuilder()
						.setName('Pending')
						.setValue('pending')
						.setDescription('View pending loans')
						.setPagination(
							async (ctx) => Loan.find({
								relations: ['guild', 'lender', 'borrower'],
								where: [
									{ lender: { userId: ctx.interaction.user.id }, pending: true },
									{ borrower: { userId: ctx.interaction.user.id }, pending: true }],
							}),
							(loan) => new ExecutionBuilder()
								.setName(`Loan ${loan.id}`)
								.setValue(loan.id)
								.setDescription(`**Created At**: \`${loan.createdAt.toLocaleString()}\`\n**Completed At**: \`${loan.completedAt?.toLocaleString() || 'N/A'}\``)
								.setExecution(async (ctx, interaction) => {
									const embed = displayLoan(loan);
									const row = new ActionRowBuilder<ButtonBuilder>()
										.setComponents([
											new ButtonBuilder()
												.setCustomId('loan_cancel')
												.setLabel('Cancel')
												.setStyle(ButtonStyle.Danger)
												.setDisabled(!(loan.pending && loan.lender.userId === ctx.interaction.user.id)),
											new ButtonBuilder()
												.setCustomId('loan_accept')
												.setLabel('Accept')
												.setStyle(ButtonStyle.Success)
												.setDisabled(!(loan.pending && loan.borrower.userId === ctx.interaction.user.id)),
										]);

									const message = await interaction.update({ embeds: [embed], components: [row] });
									const action = await message.awaitMessageComponent({ componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });
									if (action.customId === 'loan_cancel') {
										await loan.remove();
										await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_CANCEL', loan.principal, 0);
										const cancelEmbed = ctx.embedify('warn', 'user', `${Emojis.CROSS} **Loan Cancelled**`);
										await action.update({ embeds: [cancelEmbed], components: [] });
									} else if (action.customId === 'loan_accept') {
										loan.pending = false;
										loan.active = true;
										await loan.save();
										await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_ACCEPT', loan.principal, 0);
										const acceptEmbed = ctx.embedify('success', 'user', `${Emojis.CHECK} **Loan Accepted**`);
										await action.update({ embeds: [acceptEmbed], components: [] });
									}
								}),
						),
					new ExecutionBuilder()
						.setName('Complete')
						.setValue('complete')
						.setDescription('View complete loans')
						.setPagination(
							async (ctx) => Loan.find({
								relations: ['guild', 'lender', 'borrower'],
								where: [
									{ lender: { userId: ctx.interaction.user.id }, active: false, completedAt: Not(IsNull()) },
									{ borrower: { userId: ctx.interaction.user.id }, active: false, completedAt: Not(IsNull()) }],
							}),
							(loan) => new ExecutionBuilder()
								.setName(`Loan ${loan.id}`)
								.setValue(loan.id)
								.setDescription(`**Created At**: \`${loan.createdAt.toLocaleString()}\`\n**Completed At**: \`${loan.completedAt?.toLocaleString() || 'N/A'}\``)
								.setExecution(async (ctx, interaction) => {
									const embed = displayLoan(loan);
									interaction.reply({ embeds: [embed], components: [] });
								}),
						),
				]),
			new ExecutionBuilder()
				.setName('Propose')
				.setValue('propose')
				.setDescription('Propose, or create, a loan')
				.collectVar((collector) => collector
					.setProperty('borrower')
					.setPrompt('Specify a user')
					.addValidator((msg) => !!msg.mentions.users.size, 'Could not find a user mention.')
					.setParser((msg) => msg.mentions.users.first()))
				.collectVar((collector) => collector
					.setProperty('principal')
					.setPrompt('Specify a principal amount')
					.addValidator((msg) => !!parseString(msg.content), 'Did not enter a numerical value.')
					.addValidator((msg, ctx) => parseString(msg.content) <= ctx.memberEntity.wallet, 'Principal exceeds current wallet balance.')
					.addValidator((msg) => parseString(msg.content) > 0, 'Principal must be more than 0.')
					.setParser((msg) => parseString(msg.content)))
				.collectVar((collector) => collector
					.setProperty('repayment')
					.setPrompt('Specify a repayment amount')
					.addValidator((msg) => !!parseString(msg.content), 'Did not enter a numerical value.')
					.addValidator((msg) => parseString(msg.content) > 0, 'Repayment must be more than 0.')
					.setParser((msg) => parseString(msg.content)))
				.collectVar((collector) => collector
					.setProperty('duration')
					.setPrompt('Specify the duration of the loan')
					.addValidator((msg) => !!ms(msg.content), 'Did not enter a duration value.')
					.addValidator((msg) => ms(msg.content) > 0, 'Duration must be positive.')
					.setParser((msg) => ms(msg.content)))
				.collectVar((collector) => collector
					.setProperty('message')
					.setPrompt('Specify a loan message')
					.addValidator((msg) => !!msg.content, 'Input could not be parsed.')
					.setParser((msg) => msg.content))
				.setExecution(async (ctx, interaction) => {
					const borrower = this.execute.getVariable('borrower');
					const principal = this.execute.getVariable('principal');
					const repayment = this.execute.getVariable('repayment');
					const message = this.execute.getVariable('message');
					const duration = this.execute.getVariable('duration');

					// Create borrower if not exist
					await User.upsert({ id: borrower.id }, ['id']);
					await Member.upsert({ userId: borrower.id, guildId: interaction.guildId }, ['userId', 'guildId']);
					const borrowerEntity = await Member.findOneBy({ userId: borrower.id, guildId: interaction.guildId });

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
					});

					return new ExecutionBuilder()
						.setExecution(async (ctx, interaction) => {
							const embed = ctx
								.embedify('info', 'user')
								.setAuthor({ name: 'Loan Proposal', iconURL: ctx.client.emojis.resolve(parseEmoji(Emojis.MONEY_BAG).id)?.url })
								.addFields([
									{ name: '🤵‍♂️ Lender', value: `<@!${loan.lender.userId}>`, inline: true },
									{ name: `${Emojis.PERSON_ADD} Borrower`, value: `<@!${loan.borrower?.userId}>`, inline: true },
									{ name: `${Emojis.DEED} Message`, value: `*${loan.message}*` },
									{ name: `${Emojis.ECON_DOLLAR} Principal`, value: `${ctx.guildEntity.currency}${parseNumber(loan.principal)}`, inline: true },
									{ name: `${Emojis.CREDIT} Repayment`, value: `${ctx.guildEntity.currency}${parseNumber(loan.repayment)}`, inline: true },
									{ name: `${Emojis.TIME} Duration`, value: `\`${ms(loan.duration, { long: true })}\``, inline: true },
								]);

							const row = new ActionRowBuilder<ButtonBuilder>()
								.setComponents([
									new ButtonBuilder()
										.setCustomId('loan_cancel')
										.setLabel('Cancel')
										.setStyle(ButtonStyle.Danger),
									new ButtonBuilder()
										.setCustomId('loan_create')
										.setLabel('Create')
										.setStyle(ButtonStyle.Success),
								]);

							const message = await interaction.editReply({ embeds: [embed], components: [row] });
							const action = await message.awaitMessageComponent({ componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });
							if (action.customId === 'loan_cancel') {
								const cancelEmbed = ctx.embedify('success', 'user', `${Emojis.CROSS} **Loan Proposal Cancelled**`);
								await action.update({ embeds: [cancelEmbed], components: [] });
							} else if (action.customId === 'loan_create') {
								await loan.save();
								await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_PROPOSE', -loan.principal, 0);
								const successEmbed = ctx.embedify('success', 'user', `${Emojis.DEED} **Loan Proposed Successfully**`);
								await action.update({ embeds: [successEmbed], components: [] });
							}
						});
				}),
		]);
}
