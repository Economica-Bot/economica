import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, parseEmoji } from 'discord.js';
import ms from 'ms';
import { IsNull, Not } from 'typeorm';

import { Loan, Member, User } from '../../entities';
import { collectProp, displayLoan, recordTransaction } from '../../lib';
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
				.setExecution(async (ctx, interaction) => {
					const embed = ctx
						.embedify('info', 'user')
						.setAuthor({ name: 'Loan Creation Menu' })
						.setThumbnail(ctx.client.emojis.resolve(parseEmoji(Emojis.DEED).id).url);

					const borrower = await collectProp(ctx, interaction, embed, 'borrower', (msg) => !!msg.mentions.users.first() && msg.mentions.users.first().id !== interaction.user.id && !msg.mentions.users.first().bot, (msg) => msg.mentions.users.first());
					const principal = await collectProp(ctx, interaction, embed, 'principal', (msg) => !!parseString(msg.content) && parseString(msg.content) <= ctx.memberEntity.wallet, (msg) => parseString(msg.content));
					const repayment = await collectProp(ctx, interaction, embed, 'repayment', (msg) => !!parseString(msg.content), (msg) => parseString(msg.content));
					const duration = await collectProp(ctx, interaction, embed, 'duration', (msg) => !!ms(msg.content), (msg) => ms(msg.content));
					const message = await collectProp(ctx, interaction, embed, 'message', (msg) => !!msg.content, (msg) => msg.content);

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
