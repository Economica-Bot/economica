import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from '@discordjs/builders';
import {
	APIEmbedField,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	Message,
	SelectMenuInteraction,
	User,
	Util,
} from 'discord.js';
import ms from 'ms';

import { Loan, Member, User as DiscUser } from '../../entities/index.js';
import { recordTransaction } from '../../lib/transaction.js';
import { ChooseData, Command, Context, ContextEmbed, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('loan')
		.setDescription('loan')
		.setModule('ECONOMY')
		.setFormat('loan')
		.setExamples(['loan']);

	public execute = async (ctx: Context) => {
		const res1 = await this.loansMenu(ctx, ctx.interaction);
		if (res1.res.value === 'view') {
			const res2 = await this.viewLoansMenu(ctx, res1.interaction);
			const res3 = await this.displayLoans(ctx, res2.interaction, res2.data.type, res2.data.loans);
			await this.displayLoan(ctx, res3.interaction, res3.data.loan);
		} else if (res1.res.value === 'create') {
			const res2 = await this.createLoan(ctx, res1.interaction);
			await this.confirmLoanCreation(ctx, res2.interaction, res2.data.loan);
		}
	};

	public async loansMenu(ctx: Context, interaction: ChatInputCommandInteraction<'cached'>) {
		const embed = ctx
			.embedify('info', 'user', 'Create or View Loans.')
			.setAuthor({ name: 'Loan Management Menu' })
			.setThumbnail(ctx.client.emojis.resolve(Util.parseEmoji(Emojis.DEED).id).url);

		const data: ChooseData[] = [
			{
				name: 'Create a Loan',
				clean: 'Create a Loan',
				description: 'Loan money to other users',
				value: 'create',
				emoji: Emojis.CREDIT,
			},
			{
				name: 'View Loans',
				clean: 'View Loans',
				description: 'View pending, active, and complete loans',
				value: 'view',
				emoji: Emojis.DEED,
			},
		];

		const { interaction: interaction2, res } = await ctx.selectinator(interaction, embed, data);
		return { interaction: interaction2, res };
	}

	public async viewLoansMenu(ctx: Context, interaction: SelectMenuInteraction<'cached'>) {
		const loans = await Loan.find({ where: [
			{ lender: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId } },
			{ borrower: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId } },
		] });

		const embed = ctx
			.embedify('info', 'user', 'View and manage Loans.')
			.setAuthor({ name: 'Loan Distribution Menu' })
			.setThumbnail(ctx.client.emojis.resolve(Util.parseEmoji(Emojis.MONEY_BAG).id).url);

		const data: ChooseData[] = [
			{
				name: `View Pending Loans | \`${loans.filter((loan) => loan.pending).length}\``,
				clean: 'View Pending Loans',
				description: 'View loans that have not yet been accepted.',
				value: 'pending',
				emoji: Emojis.DEED,
			},
			{
				name: `View Active Loans | \`${loans.filter((loan) => loan.active).length}\``,
				clean: 'View Active Loans',
				description: 'View loans that are currently underway.',
				value: 'active',
				emoji: Emojis.COG,
			},
			{
				name: `View Complete Loans | \`${loans.filter((loan) => loan.completedAt).length}\``,
				clean: 'View Complete Loans',
				description: 'View loans that have been fully processed.',
				value: 'complete',
				emoji: Emojis.DEED,
			},
		];

		const { interaction: interaction2, res } = await ctx.selectinator(interaction, embed, data);

		const loanFilters: Record<string, (loan: Loan) => boolean> = {
			pending: (loan) => loan.pending,
			active: (loan) => loan.active,
			complete: (loan) => loan.completedAt !== null,
		};

		const filteredLoans = loans.filter(loanFilters[res.value]);
		return { interaction: interaction2, data: { type: res.value, loans: filteredLoans } };
	}

	public async displayLoans(ctx: Context, interaction: SelectMenuInteraction<'cached'>, type: string, loans: Loan[]) {
		const loanFields: Record<string, APIEmbedField> = {
			pending: { name: `${Emojis.MONEY_BAG} Pending Loans`, value: 'Pending loans are loans that have not yet been accepted by the borrower.' },
			active: { name: `${Emojis.CREDIT} Active Loans`, value: 'Active loans are loans that have been accepted by the borrower and are currently in effect. **Note**: Loans are updated every 5 minutes.' },
			complete: { name: `${Emojis.CHECK} Complete Loans`, value: 'Complete loans are loans that have been repayed and fully processed.' },
		};

		const embed = ctx
			.embedify('info', 'user')
			.setThumbnail(ctx.client.emojis.resolve(Util.parseEmoji(Emojis.DEED).id).url)
			.addFields([loanFields[type]]);

		const data: ChooseData[] = loans.map((loan) => ({
			name: `Principal ${ctx.guildEntity.currency} \`${parseNumber(loan.principal)}\` | Repayment ${ctx.guildEntity.currency} \`${parseNumber(loan.repayment)}\``,
			clean: `Loan With Principal ${parseNumber(loan.principal)}`,
			description: `From <@${loan.lender.userId}> to <@${loan.borrower.userId}>`,
			value: loan.id,
			emoji: loan.borrower.userId === ctx.interaction.user.id ? ':arrow_right:' : ':arrow_left:',
		}));

		const { interaction: interaction2, res } = await ctx.selectinator(interaction, embed, data);

		const loan = loans.find(({ id }) => id === res.value);
		return { interaction: interaction2, data: { loan } };
	}

	public async displayLoan(ctx: Context, interaction: SelectMenuInteraction<'cached'>, loan: Loan) {
		const embed = ctx
			.embedify('info', 'user', `**Created At**: \`${loan.createdAt.toLocaleString()}\`\n**Completed At**: \`${loan.completedAt?.toLocaleString() || 'N/A'}\``)
			.setAuthor({ name: `Loan ${loan.id}`, iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.MONEY_BAG).id)?.url })
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
					.setCustomId('cancel')
					.setLabel('Cancel')
					.setStyle(ButtonStyle.Danger)
					.setDisabled(!(loan.pending && loan.lender.userId === ctx.interaction.user.id)),
				new ButtonBuilder()
					.setCustomId('accept')
					.setLabel('Accept')
					.setStyle(ButtonStyle.Success)
					.setDisabled(!(loan.pending && loan.borrower.userId === ctx.interaction.user.id)),
			]);

		const message = await interaction.update({ embeds: [embed], components: [row] });
		const action = await message.awaitMessageComponent<ComponentType.Button>();
		if (action.customId === 'cancel') {
			loan.pending = false;
			await loan.save();
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_CANCEL', loan.principal, 0);
			const cancelEmbed = ctx.embedify('success', 'user', `${Emojis.CROSS} **Loan Cancelled**`);
			await action.update({ embeds: [cancelEmbed], components: [] });
		} else if (action.customId === 'accept') {
			loan.pending = false;
			loan.active = true;
			await loan.save();
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_ACCEPT', loan.principal, 0);
			const acceptEmbed = ctx.embedify('success', 'user', `${Emojis.CHECK} **Loan Accepted**`);
			await action.update({ embeds: [acceptEmbed], components: [] });
		}
	}

	public async createLoan(ctx: Context, interaction: SelectMenuInteraction<'cached'>) {
		const embed = ctx
			.embedify('info', 'user')
			.setAuthor({ name: 'Loan Creation Menu' })
			.setThumbnail(ctx.client.emojis.resolve(Util.parseEmoji(Emojis.DEED).id).url);

		const borrower = await this.collectProp<User>(ctx, interaction, embed, 'borrower', 'Specify a borrower', (msg) => !!msg.mentions.users.first() && msg.mentions.users.first().id !== interaction.user.id && !msg.mentions.users.first().bot, (msg) => msg.mentions.users.first());
		const principal = await this.collectProp<number>(ctx, interaction, embed, 'principal', 'Specify an initial payment', (msg) => !!parseString(msg.content) && parseString(msg.content) <= ctx.memberEntity.wallet, (msg) => parseString(msg.content));
		const repayment = await this.collectProp<number>(ctx, interaction, embed, 'repayment', 'Specify a repayment', (msg) => !!parseString(msg.content), (msg) => parseString(msg.content));
		const duration = await this.collectProp<number>(ctx, interaction, embed, 'duration', 'Specify a duration', (msg) => !!ms(msg.content), (msg) => ms(msg.content));
		const message = await this.collectProp<string>(ctx, interaction, embed, 'message', 'Specify a message', (msg) => !!msg.content, (msg) => msg.content);

		// Create borrower if not exist
		await DiscUser.upsert({ id: borrower.id }, ['id']);
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

		return { interaction, data: { loan } };
	}

	public async collectProp<T>(ctx: Context, interaction: SelectMenuInteraction<'cached'>, base: ContextEmbed, property: string, prompt: string, validate: (msg: Message<true>) => boolean, parse: (msg: Message<true>) => T): Promise<T> {
		const embed = new EmbedBuilder(base.data);
		embed.setDescription(prompt);
		if (interaction.replied) await interaction.editReply({ embeds: [embed], components: [] });
		else await interaction.update({ embeds: [embed], components: [] });
		const res = await interaction.channel.awaitMessages({ max: 1 });
		if (!validate(res.first() as Message<true>)) {
			await interaction.followUp({ embeds: [ctx.embedify('error', 'user', `Invalid \`${property}\``)], ephemeral: true });
			return this.collectProp(ctx, interaction, base, property, prompt, validate, parse);
		}

		return parse(res.first() as Message<true>);
	}

	public async confirmLoanCreation(ctx: Context, interaction: SelectMenuInteraction<'cached'>, loan: Loan) {
		const embed = ctx
			.embedify('info', 'user')
			.setAuthor({ name: 'Loan Proposal', iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.MONEY_BAG).id)?.url })
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
					.setCustomId('cancel')
					.setLabel('Cancel')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('create')
					.setLabel('Create')
					.setStyle(ButtonStyle.Success),
			]);

		const message = await interaction.followUp({ embeds: [embed], components: [row] });
		const action = await message.awaitMessageComponent<ComponentType.Button>();
		if (action.customId === 'cancel') {
			const cancelEmbed = ctx.embedify('success', 'user', `${Emojis.CROSS} **Loan Proposal Cancelled**`);
			await action.update({ embeds: [cancelEmbed], components: [] });
		} else if (action.customId === 'create') {
			await loan.save();
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_PROPOSE', -loan.principal, 0);
			const successEmbed = ctx.embedify('success', 'user', `${Emojis.DEED} **Loan Created Successfully**`);
			await action.update({ embeds: [successEmbed], components: [] });
		}
	}
}
