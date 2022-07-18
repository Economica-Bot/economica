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

									const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
									const action = await message.awaitMessageComponent({ componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });
									if (action.customId === 'loan_cancel') {
										loan.pending = false;
										await loan.save();
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
				.collectVar({
					property: 'borrower',
					prompt: 'Specify a user by ID',
					validators: [{ function: (ctx, input) => !!input.match(/\d{17,19}/)?.[0], error: 'Input is not a user snowflake' },
						{ function: async (ctx, input) => !!(await ctx.client.users.fetch(input).catch(() => null)), error: 'Could not find that user' },
						{ function: (ctx, input) => input !== ctx.interaction.user.id, error: 'You cannot loan towards yourself!' },
						{ function: (ctx, input) => !ctx.client.users.cache.get(input).bot, error: 'You cannot loan towards a bot!' }],
					parse: (ctx, input) => ctx.client.users.cache.get(input),
				})
				.collectVar({
					property: 'principal',
					prompt: 'Specify a principal amount',
					validators: [{ function: (ctx, input) => !!parseString(input), error: 'Input could not be parsed' },
						{ function: (ctx, input) => parseString(input) <= ctx.memberEntity.wallet, error: 'Principal is more than your wallet!' },
						{ function: (ctx, input) => parseString(input) > 0, error: 'Principal must be more than 0.' }],
					parse: (ctx, input) => parseString(input),
				})
				.collectVar({
					property: 'repayment',
					prompt: 'Specify a repayment amount',
					validators: [{ function: (ctx, input) => !!parseString(input), error: 'Input could not be parsed' },
						{ function: (ctx, input) => parseString(input) > 0, error: 'Repayment must be more than 0' }],
					parse: (ctx, input) => parseString(input),
				})
				.collectVar({
					property: 'duration',
					prompt: 'Specify the duration of the loan',
					validators: [{ function: (ctx, input) => !!ms(input), error: 'Input could not be parsed' }],
					parse: (ctx, input) => ms(input),
				})
				.collectVar({
					property: 'message',
					prompt: 'Specify a loan message',
					validators: [{ function: (input) => !!input, error: 'Input could not be parsed' }],
					parse: (ctx, input) => input,
				})
				.setExecution(async (ctx, interaction) => {
					const borrower = this.execute.getVariable('borrower', this.execute);
					const principal = this.execute.getVariable('principal', this.execute);
					const repayment = this.execute.getVariable('repayment', this.execute);
					const message = this.execute.getVariable('message', this.execute);
					const duration = this.execute.getVariable('duration', this.execute);

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
