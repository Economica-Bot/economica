import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, PermissionFlagsBits } from 'discord.js';

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
				.collectVar((collector) => collector
					.setProperty('user')
					.setPrompt('Specify a user')
					.addValidator((msg) => !!msg.mentions.users.size, 'Could not find any user mentions.')
					.setParser((msg) => msg.mentions.users.first()))
				.setPagination(
					(ctx) => Infraction.find({ relations: ['target', 'agent'], where: { guild: { id: ctx.interaction.guildId }, target: { userId: this.execute.getVariable('user').id } } }),
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
				),
		]);
}
