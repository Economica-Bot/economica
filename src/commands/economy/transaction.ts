import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, ComponentType, PermissionFlagsBits } from 'discord.js';

import { Transaction } from '../../entities';
import { displayTransaction } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('transaction')
		.setDescription('View and manage transactions')
		.setModule('MODERATION')
		.setFormat('transaction')
		.setExamples(['transaction'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

	public execute = new ExecutionBuilder()
		.setName('Transactions')
		.setValue('transaction_top')
		.setDescription('View and manage transactions')
		.setOptions([
			new ExecutionBuilder()
				.setName('View Server transactions')
				.setValue('transaction_view_server')
				.setDescription('Viewing all server transactions')
				.setPagination(
					(ctx) => Transaction.find({ relations: ['target', 'agent', 'guild'], where: { guild: { id: ctx.interaction.guildId } } }),
					(transaction) => new ExecutionBuilder()
						.setName(transaction.type)
						.setValue(transaction.id)
						.setDescription(`Target: <@!${transaction.target.userId}> | Agent: <@!${transaction.agent.userId}>`)
						.setExecution(async (ctx, interaction) => {
							const embed = displayTransaction(transaction);
							const row = new ActionRowBuilder<ButtonBuilder>()
								.setComponents([
									new ButtonBuilder()
										.setCustomId('transaction_delete')
										.setLabel('Delete')
										.setStyle(ButtonStyle.Danger),
								]);
							const msg = await interaction.update({ embeds: [embed], components: [row], fetchReply: true });
							const res = await msg.awaitMessageComponent({ componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });
							if (res.customId === 'transaction_delete') {
								await transaction.remove();
								const embed = ctx.embedify('success', 'user', 'Transaction deleted.');
								res.update({ embeds: [embed], components: [] });
							}
						}),
				),
			new ExecutionBuilder()
				.setName('View User Transactions')
				.setValue('transaction_view_user')
				.setDescription('View all transactions by a specific user')
				.setExecution(async (ctx, interaction) => {
					await interaction.reply({ content: 'Mention a user', ephemeral: true });
					const msgs = await interaction.channel.awaitMessages({ max: 1, filter: (msg) => msg.author.id === ctx.interaction.user.id });
					const user = msgs.first().mentions.users.first();
					if (!user) {
						await interaction.followUp({ content: 'Could not find mention', ephemeral: true });
						return undefined;
					}

					return new ExecutionBuilder()
						.setName('Viewing User transactions')
						.setValue('transaction_viewing_user')
						.setDescription(`Viewing <@${user.id}>'s transactions`)
						.setPagination(
							(ctx) => Transaction.find({ relations: ['target', 'agent', 'guild'], where: { guild: { id: ctx.interaction.guildId }, target: { userId: user.id } } }),
							(transaction) => new ExecutionBuilder()
								.setName(transaction.type)
								.setValue(transaction.id)
								.setDescription(`Target: <@!${transaction.target.userId}> | Agent: <@!${transaction.agent.userId}>`)
								.setExecution(async (ctx, interaction) => {
									const embed = displayTransaction(transaction);
									const row = new ActionRowBuilder<ButtonBuilder>()
										.setComponents([
											new ButtonBuilder()
												.setCustomId('transaction_delete')
												.setLabel('Delete')
												.setStyle(ButtonStyle.Danger),
										]);
									const msg = await interaction.update({ embeds: [embed], components: [row], fetchReply: true });
									const res = await msg.awaitMessageComponent({ componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });
									if (res.customId === 'transaction_delete') {
										await transaction.remove();
										const embed = ctx.embedify('success', 'user', 'Transaction Deleted');
										res.update({ embeds: [embed], components: [] });
									}
								}),
						);
				}),
		]);
}
