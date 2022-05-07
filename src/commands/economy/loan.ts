/* eslint-disable no-param-reassign */
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ComponentType,
	GuildMember,
	Util,
} from 'discord.js';
import ms from 'ms';

import { Loan, Member, User } from '../../entities/index.js';
import { recordTransaction } from '../../lib/transaction.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('loan')
		.setDescription('Lend money to other users.')
		.setModule('ECONOMY')
		.setFormat('loan')
		.setExamples(['loan']);

	public execute = async (ctx: Context): Promise<void> => {
		const description = `**Welcome ${ctx.interaction.member} to your loan dashboard! Here, you can make new loans, view active loans, or manage pending loans.**\n\n**${Emojis.SELECT} Select a category below to get started.**`;
		const embed = ctx.embedify('info', 'user', description)
			.setAuthor({ name: 'Loan Dashboard', iconURL: ctx.interaction.guild.iconURL() })
			.addFields([
				{ name: `${Emojis.LOAN} Create`, value: 'Make a new loan', inline: true },
				{ name: `${Emojis.ESCROW} View`, value: 'View active loans', inline: true },
				{ name: `${Emojis.FUNDS} Manage`, value: 'Accept or Deny pending loans', inline: true },
			]);
		const row = new ActionRowBuilder<ButtonBuilder>()
			.setComponents([
				new ButtonBuilder()
					.setEmoji(Util.resolvePartialEmoji(Emojis.LOAN))
					.setCustomId('create')
					.setLabel('Create')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setEmoji(Util.resolvePartialEmoji(Emojis.FUNDS))
					.setCustomId('manage')
					.setLabel('Manage')
					.setStyle(ButtonStyle.Secondary),
			]);
		const message = await ctx.interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
		const interaction = await message.awaitMessageComponent<ComponentType.Button>({ filter: (i) => i.user.id === ctx.interaction.user.id });
		await interaction.update({ components: [] });
		if (interaction.customId === 'create') {
			const loan = Loan.create({ guild: ctx.guildEntity, lender: ctx.memberEntity, description: 'No description', pending: true, active: false });
			await this.initializeLoan(ctx, interaction, loan);
		} else if (interaction.customId === 'manage') {
			await this.manageLoans(ctx, interaction);
		}
	};

	private async displayLoan(ctx: Context, interaction: ButtonInteraction<'cached'>, loan: Loan) {
		const createEmbed = ctx.embedify('info', 'user')
			.setAuthor({ name: 'Loan Viewer', iconURL: ctx.interaction.guild.iconURL() })
			.addFields([
				{ name: 'Lender', value: `<@!${loan.lender.userId}>`, inline: true },
				{ name: 'Borrower', value: `<@!${loan.borrower?.userId}>`, inline: true },
				{ name: 'Description', value: `**${loan.description}**` },
				{ name: 'Principal', value: loan.principal?.toLocaleString() || 'Unset', inline: true },
				{ name: 'Repayment', value: loan.repayment?.toLocaleString() || 'Unset', inline: true },
				{ name: 'Duration', value: ms(loan.duration || 0) || 'Unset', inline: true },
			]);
		await interaction.followUp({ embeds: [createEmbed], fetchReply: true });
	}

	private async collectBorrower(interaction: ButtonInteraction<'cached'>): Promise<GuildMember | undefined> {
		await interaction.followUp('Mention a borrower, or `cancel` to cancel:');
		const message = (await interaction.channel.awaitMessages({ filter: (msg) => msg.author.id === interaction.user.id, maxProcessed: 1 })).first();
		if (message.content === 'cancel') {
			await interaction.followUp('Loan Canceled');
			return undefined;
		}

		const mention = message.mentions.members.first();
		if (!mention) {
			await interaction.followUp('Did not mention borrower');
			return this.collectBorrower(interaction);
		}

		if (mention.id === interaction.user.id) {
			await interaction.followUp('You cannot loan to yourself.');
			return this.collectBorrower(interaction);
		}

		if (mention.id === interaction.client.user.id) {
			await interaction.followUp('You cannot loan to me.');
			return this.collectBorrower(interaction);
		}

		return mention;
	}

	private async collectDescription(interaction: ButtonInteraction<'cached'>) {
		await interaction.followUp('Type a description or message, or `cancel` to cancel:');
		const message = (await interaction.channel.awaitMessages({ filter: (msg) => msg.author.id === interaction.user.id, maxProcessed: 1 })).first();
		if (message.content === 'cancel') {
			await interaction.followUp('Loan Canceled');
			return undefined;
		}

		return message.content;
	}

	private async collectPrincipal(interaction: ButtonInteraction<'cached'>) {
		await interaction.followUp('Enter a principal, or `cancel` to cancel:');
		const message = (await interaction.channel.awaitMessages({ filter: (msg) => msg.author.id === interaction.user.id, maxProcessed: 1 })).first();
		if (message.content === 'cancel') {
			await interaction.followUp('Loan Canceled');
			return undefined;
		}

		if (!+message.content) {
			await interaction.followUp('Invalid principal');
			return this.collectPrincipal(interaction);
		}

		return +message.content;
	}

	private async collectRepayment(interaction: ButtonInteraction<'cached'>) {
		await interaction.followUp('Enter a repayment, or `cancel` to cancel:');
		const message = (await interaction.channel.awaitMessages({ filter: (msg) => msg.author.id === interaction.user.id, maxProcessed: 1 })).first();
		if (message.content === 'cancel') {
			await interaction.followUp('Loan Canceled');
			return undefined;
		}

		if (!+message.content) {
			await interaction.followUp('Invalid repayment');
			return this.collectRepayment(interaction);
		}

		return +message.content;
	}

	private async collectDuration(interaction: ButtonInteraction<'cached'>) {
		await interaction.followUp('Enter a duration, or `cancel` to cancel:');
		const message = (await interaction.channel.awaitMessages({ filter: (msg) => msg.author.id === interaction.user.id, maxProcessed: 1 })).first();
		if (message.content === 'cancel') {
			await interaction.followUp('Loan Canceled');
			return undefined;
		}

		if (!ms(message.content)) {
			await interaction.followUp('Invalid duration');
			return this.collectDuration(interaction);
		}

		return ms(message.content);
	}

	private async confirmLoan(ctx: Context, interaction: ButtonInteraction<'cached'>, loan: Loan) {
		const confirmEmbed = ctx.embedify('info', 'user', '**Confirm that this loan is correct.**');
		const confirmRow = new ActionRowBuilder<ButtonBuilder>()
			.setComponents([
				new ButtonBuilder()
					.setCustomId('cancel')
					.setStyle(ButtonStyle.Danger)
					.setLabel('Cancel'),
				new ButtonBuilder()
					.setCustomId('edit')
					.setStyle(ButtonStyle.Primary)
					.setLabel('Edit'),
				new ButtonBuilder()
					.setCustomId('publish')
					.setStyle(ButtonStyle.Success)
					.setLabel('Publish'),
			]);
		const message = await interaction.followUp({ embeds: [confirmEmbed], components: [confirmRow], fetchReply: true });
		const i = await message.awaitMessageComponent<ComponentType.Button>({ filter: (int) => int.user.id === ctx.interaction.user.id });
		if (i.customId === 'cancel') {
			await i.update({ content: 'Loan Canceled', embeds: [], components: [] });
		} else if (i.customId === 'edit') {
			await i.update({ content: 'Loan Editing', embeds: [], components: [] });
			this.initializeLoan(ctx, interaction, loan);
		} else if (i.customId === 'publish') {
			await loan.save();
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'LOAN_PROPOSE', loan.principal, 0);
			await i.update({ content: 'Loan Proposed', embeds: [], components: [] });
		}
	}

	private async initializeLoan(ctx: Context, interaction: ButtonInteraction<'cached'>, loan: Loan) {
		await this.displayLoan(ctx, interaction, loan);
		const borrower = await this.collectBorrower(interaction);
		if (!borrower) return;
		await User.upsert({ id: borrower.id }, ['id']);
		await Member.upsert({ userId: borrower.id, guildId: borrower.guild.id }, ['userId', 'guildId']);
		loan.borrower = await Member.findOneBy({ userId: borrower.id, guildId: borrower.guild.id });
		await this.displayLoan(ctx, interaction, loan);
		const description = await this.collectDescription(interaction);
		if (!description) return;
		loan.description = description;
		await this.displayLoan(ctx, interaction, loan);
		const principal = await this.collectPrincipal(interaction);
		if (!principal) return;
		loan.principal = principal;
		await this.displayLoan(ctx, interaction, loan);
		const repayment = await this.collectRepayment(interaction);
		if (!repayment) return;
		loan.repayment = repayment;
		await this.displayLoan(ctx, interaction, loan);
		const duration = await this.collectDuration(interaction);
		if (!duration) return;
		loan.duration = duration;
		await this.displayLoan(ctx, interaction, loan);
		await this.confirmLoan(ctx, interaction, loan);
	}

	private async manageLoans(ctx: Context, interaction: ButtonInteraction<'cached'>) {
		const loans = await Loan.findBy({ guild: { id: ctx.guildEntity.id } });
		const outgoingLoans = loans.filter((loan) => loan.lender.userId === ctx.memberEntity.userId);
		const incomingLoans = loans.filter((loan) => loan.borrower.userId === ctx.memberEntity.userId);
		const loanEmbed = ctx.embedify('info', 'user')
			.setAuthor({ name: 'Loan Management Menu', iconURL: ctx.interaction.guild.iconURL() })
			.addFields([
				{ name: 'Pending Loans', value: 'Pending loans are loans that have not yet been accepted by the borrower.' },
				{ name: 'Outgoing', value: outgoingLoans.filter((loan) => loan.pending).map((loan) => `\`${loan.id}\``).join('\n') || 'None', inline: true },
				{ name: 'Incoming ', value: incomingLoans.filter((loan) => loan.pending).map((loan) => `\`${loan.id}\``).join('\n') || 'None', inline: true },
				{ name: 'Active Loans', value: 'Active loans are loans that have been accepted.' },
				{ name: 'Outgoing', value: outgoingLoans.filter((loan) => loan.active).map((loan) => `\`${loan.id}\``).join('\n') || 'None', inline: true },
				{ name: 'Incoming ', value: incomingLoans.filter((loan) => loan.active).map((loan) => `\`${loan.id}\``).join('\n') || 'None', inline: true },
			]);
		const row = new ActionRowBuilder<ButtonBuilder>()
			.setComponents([
				new ButtonBuilder()
					.setCustomId('view')
					.setLabel('View')
					.setStyle(ButtonStyle.Primary),
			]);

		const message = await interaction.followUp({ embeds: [loanEmbed], components: [row] });
		const int = await message.awaitMessageComponent<ComponentType.Button>({ filter: (i) => i.user.id === interaction.user.id });
		if (int.customId === 'view') {
			await int.reply({ content: 'Enter a loan ID', fetchReply: true });
			const msg = (await interaction.channel.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, maxProcessed: 1 })).first();
			const loan = await Loan.findOneBy({ guild: { id: interaction.guildId }, id: msg.content });
			if (!loan) int.followUp(`Could not find loan with that id \`${message.content}\``);
			else this.displayLoan(ctx, int, loan);
		}
	}
}
