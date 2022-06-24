import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, ComponentType, PermissionFlagsBits } from 'discord.js';

import { Infraction } from '../../entities';
import { displayInfraction } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('infraction')
		.setDescription('View and manage infractions')
		.setModule('MODERATION')
		.setFormat('infraction')
		.setExamples(['infraction'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

	public execute = new ExecutionBuilder()
		.setName('Infractions')
		.setValue('infraction_top')
		.setDescription('View and manage infractions')
		.setOptions([
			new ExecutionBuilder()
				.setName('View Server Infractions')
				.setValue('infraction_view_server')
				.setDescription('Viewing all server infractions')
				.setPagination(
					(ctx) => Infraction.find({ relations: ['target', 'agent'], where: { guild: { id: ctx.interaction.guildId } } }),
					(infraction) => new ExecutionBuilder()
						.setName(infraction.type)
						.setValue(infraction.id)
						.setDescription(`User: <@${infraction.target.userId}> | <t:${Math.round(infraction.createdAt.getTime() / 1000)}>\n\`\`\`${infraction.reason}\`\`\``)
						.setExecution(async (ctx, interaction) => {
							const embed = displayInfraction(infraction);
							const row = new ActionRowBuilder<ButtonBuilder>()
								.setComponents([
									new ButtonBuilder()
										.setCustomId('infraction_delete')
										.setLabel('Delete')
										.setStyle(ButtonStyle.Danger),
								]);
							const msg = await interaction.update({ embeds: [embed], components: [row], fetchReply: true });
							const res = await msg.awaitMessageComponent({ componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });
							if (res.customId === 'infraction_delete') {
								await infraction.remove();
								const embed = ctx.embedify('success', 'user', 'Infraction deleted.');
								res.update({ embeds: [embed], components: [] });
							}
						}),
				),
			new ExecutionBuilder()
				.setName('View User Infractions')
				.setValue('infraction_view_user')
				.setDescription('View all infractions by a specific user')
				.setExecution(async (ctx, interaction) => {
					await interaction.reply({ content: 'Mention a user', ephemeral: true });
					const msgs = await interaction.channel.awaitMessages({ max: 1, filter: (msg) => msg.author.id === ctx.interaction.user.id });
					const user = msgs.first().mentions.users.first();
					if (!user) {
						await interaction.followUp({ content: 'Could not find mention', ephemeral: true });
						return undefined;
					}

					return new ExecutionBuilder()
						.setName('Viewing User Infractions')
						.setValue('infraction_viewing_user')
						.setDescription(`Viewing <@${user.id}>'s Infractions`)
						.setPagination(
							(ctx) => Infraction.find({ relations: ['target', 'agent'], where: { guild: { id: ctx.interaction.guildId }, target: { userId: user.id } } }),
							(infraction) => new ExecutionBuilder()
								.setName(infraction.type)
								.setValue(infraction.id)
								.setDescription(`Moderator: <@${infraction.agent.userId}> | <t:${Math.round(infraction.createdAt.getTime() / 1000)}>\n\`\`\`${infraction.reason}\`\`\``)
								.setExecution(async (ctx, interaction) => {
									const embed = displayInfraction(infraction);
									const row = new ActionRowBuilder<ButtonBuilder>()
										.setComponents([
											new ButtonBuilder()
												.setCustomId('infraction_delete')
												.setLabel('Delete')
												.setStyle(ButtonStyle.Danger),
										]);
									const msg = await interaction.update({ embeds: [embed], components: [row], fetchReply: true });
									const res = await msg.awaitMessageComponent({ componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });
									if (res.customId === 'infraction_delete') {
										await infraction.remove();
										const embed = ctx.embedify('success', 'user', 'Infraction Deleted');
										res.update({ embeds: [embed], components: [] });
									}
								}),
						);
				}),
		]);
}
