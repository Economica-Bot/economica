/* eslint-disable no-param-reassign */
import {
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
	Modal,
	SelectMenuInteraction,
	TextInputComponent,
} from 'discord.js';
import ms from 'ms';

import { Loan } from '../../entities';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('loan')
		.setDescription('Lend money to other users.')
		.setFormat('loan')
		.setExamples(['loan'])
		.setModule('ECONOMY');

	public execute = async (ctx: Context): Promise<void> => {
		const loans = await Loan.find({ guild: ctx.guildEntity });
		const embed = ctx.embedify('info', 'user', `**Welcome ${ctx.interaction.member} to your loan dashboard! Here, you can make new loans, view active loans, or manage pending loans.**\n\n**${Emojis.SELECT} Select a category below to get started.**`)
			.setAuthor({ name: 'Loan Dashboard', iconURL: ctx.interaction.guild.iconURL() })
			.addFields([
				{ name: `${Emojis.CREATE_LOAN} Create`, value: 'Make a new loan', inline: true },
				{ name: `${Emojis.ACTIVE_LOAN} View`, value: 'View active loans', inline: true },
				{ name: `${Emojis.MANAGE_LOAN} Manage`, value: 'Accept or Deny pending loans', inline: true },
			]);
		const dropdown = new MessageActionRow()
			.setComponents([
				new MessageSelectMenu()
					.setPlaceholder('None Selected')
					.setCustomId('loan_select')
					.setOptions([
						{ emoji: Emojis.CREATE_LOAN, label: 'Create', value: 'create' },
						{ emoji: Emojis.MANAGE_LOAN, label: 'Manage', value: 'manage' },
					]),
			]);
		const message = await ctx.interaction.reply({ embeds: [embed], components: [dropdown], fetchReply: true });
		const collector = message.createMessageComponentCollector({ componentType: 'SELECT_MENU', filter: (i) => i.user.id === ctx.interaction.user.id });
		collector.on('collect', async (i) => {
			if (i.values[0] === 'create') {
				const loan = Loan.create({ guild: ctx.guildEntity, lender: ctx.memberEntity, valid: false, pending: true, active: false, complete: false });
				await this.createLoan(ctx, i, loan);
			} else if (i.values[0] === 'manage') {
				const outgoingLoans = loans.filter((loan) => loan.lender === ctx.memberEntity);
				const incomingLoans = loans.filter((loan) => loan.borrower === ctx.memberEntity);
				const loanEmbed = ctx.embedify('info', 'user')
					.setAuthor({ name: 'Loan Management Menu', iconURL: ctx.interaction.guild.iconURL() })
					.addFields([
						{ name: 'Pending Loans', value: 'Pending loans are loans that have not yet been accepted by the borrower.' },
						{ name: 'Outgoing', value: outgoingLoans.filter((loan) => loan.pending).map((loan) => loan.id).join('\n') || 'None', inline: true },
						{ name: 'Incoming ', value: incomingLoans.filter((loan) => loan.pending).map((loan) => loan.id).join('\n') || 'None', inline: true },
						{ name: 'Active Loans', value: 'Active loans are loans that have been accepted.' },
						{ name: 'Outgoing', value: outgoingLoans.filter((loan) => loan.active).map((loan) => loan.id).join('\n') || 'None', inline: true },
						{ name: 'Incoming ', value: incomingLoans.filter((loan) => loan.active).map((loan) => loan.id).join('\n') || 'None', inline: true },
					]);

				await i.reply({ embeds: [loanEmbed] });
			}
		});
	};

	private async validateLoan(ctx: Context, loan: Loan): Promise<string[]> {
		const errors = [];

		if (!loan.borrower) errors.push('Missing borrower');
		else if (!(await ctx.interaction.guild.members.fetch(loan.borrower.user.id).catch(() => null))) errors.push('Invalid Borrower');
		if (!loan.description) errors.push('Missing description');
		if (!loan.principal) errors.push('Missing principal');
		else if (!+loan.principal) errors.push('Invalid principal');
		if (!loan.repayment) errors.push('Missing repayment');
		else if (!+loan.repayment) errors.push('Invalid repayment');
		if (!loan.duration) errors.push('Missing expiration');
		else if (!ms(loan.duration)) errors.push('Invalid expiration');

		return errors;
	}

	private async createLoan(ctx: Context, interaction: SelectMenuInteraction<'cached'>, loan: Loan) {
		const createEmbed = ctx.embedify('info', 'user')
			.setAuthor({ name: 'Loan Editor', iconURL: ctx.interaction.guild.iconURL() })
			.setDescription(
				`**Welcome ${ctx.interaction.member} to the loan editor!**
				
				*Note:* \`Lender\` & \`Borrower\` are entered with ID
				*Loan Validated*: \`${loan.valid}\` 
				**From**: \`${loan.lender}\` | **To**: \`${loan.borrower}\`
				**Description**
				> ${loan.description}
			`,
			).addFields([
				{ name: 'Principal', value: loan.principal?.toLocaleString() || 'Unset', inline: true },
				{ name: 'Repayment', value: loan.repayment?.toLocaleString() || 'Unset', inline: true },
				{ name: 'Duration', value: loan.duration?.toString() || 'Unset', inline: true },
			]);

		const rawModal = new Modal()
			.setTitle('Loan Interface')
			.addComponents(...[
				new MessageActionRow<TextInputComponent>().setComponents(
					new TextInputComponent().setCustomId('borrower').setLabel('Borrower').setStyle('SHORT').setMinLength(1),
				),
				new MessageActionRow<TextInputComponent>().setComponents(
					new TextInputComponent().setCustomId('description').setLabel('description').setStyle('PARAGRAPH').setMinLength(1),
				),
				new MessageActionRow<TextInputComponent>().setComponents(
					new TextInputComponent().setCustomId('principal').setLabel('Principal').setStyle('SHORT').setMinLength(1),
				),
				new MessageActionRow<TextInputComponent>().setComponents(
					new TextInputComponent().setCustomId('repayment').setLabel('Repayment').setStyle('SHORT').setMinLength(1),
				),
				new MessageActionRow<TextInputComponent>().setComponents(
					new TextInputComponent().setCustomId('duration').setLabel('Duration').setStyle('SHORT').setMinLength(1),
				),
			]);

		const row = new MessageActionRow()
			.setComponents([
				new MessageButton().setCustomId('edit').setLabel('Edit').setStyle('PRIMARY'),
				new MessageButton().setCustomId('cancel').setLabel('Cancel').setStyle('DANGER'),
				new MessageButton().setCustomId('validate').setLabel('Validate').setStyle('SECONDARY'),
				new MessageButton().setCustomId('publish').setLabel('Publish').setStyle('SUCCESS').setDisabled(!loan.valid),
			]);

		const msg = interaction.replied
			? await interaction.editReply({ embeds: [createEmbed], components: [row] })
			: await interaction.reply({ embeds: [createEmbed], components: [row], fetchReply: true });
		const collector = msg.createMessageComponentCollector({ filter: (i) => i.user.id === ctx.interaction.user.id });
		collector.on('collect', async (i) => {
			if (i.customId === 'edit') {
				const customId = `modal-${i.id}`;
				const modal = new Modal({ ...rawModal, customId });
				await i.showModal(modal);
				const modalSubmit = await i.awaitModalSubmit({ filter: (filterInteraction) => filterInteraction.customId === customId, time: 1000 * 60 * 2 }).catch(() => null);
				['borrower', 'description', 'principal', 'repayment', 'duration'].forEach((key) => {
					if (modalSubmit.fields.getTextInputValue(key)) loan[key] = modalSubmit.fields.getTextInputValue(key);
				});
				modalSubmit.reply({ content: '✅ Input Received ☝️', ephemeral: true });
				collector.stop();
				this.createLoan(ctx, interaction, loan);
			} else if (i.customId === 'cancel') {
				await interaction.editReply({ components: [] });
				i.reply('❕ Loan Canceled');
			} else if (i.customId === 'validate') {
				const errors = await this.validateLoan(ctx, loan);
				if (errors.length) {
					i.reply({ content: `Could not validate! Errors:\n${errors.join('\n')}`, ephemeral: true });
					loan.valid = false;
					collector.stop();
					this.createLoan(ctx, interaction, loan);
				} else {
					i.reply('✅ Loan Validated');
					loan.valid = true;
					collector.stop();
					this.createLoan(ctx, interaction, loan);
				}
			} else if (i.customId === 'publish') {
				loan.pending = true;
				loan.principal = +loan.principal;
				loan.repayment = +loan.repayment;
				loan.duration = Number(ms(loan.duration));
				await Loan.save(loan);
				await interaction.editReply({ components: [] });
				i.reply('✅ Loan Published');
			}
		});
	}
}
