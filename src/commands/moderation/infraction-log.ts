import { PermissionFlagsBits, TextChannel } from 'discord.js';

import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('infraction-log')
		.setDescription('Manage the infraction logging channel')
		.setModule('MODERATION')
		.setFormat('infraction-log <view | set | reset> [channel]')
		.setExamples(['infraction-log view', 'infraction-log set #infraction-logs', 'infraction-log reset'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execute = new ExecutionBuilder()
		.setName('Infraction Log')
		.setValue('infraction-log')
		.setDescription('Manage the infraction logging channel')
		.setOptions([
			new ExecutionBuilder()
				.setName('View')
				.setValue('view')
				.setDescription('View the current infraction log')
				.setExecution(async (ctx, interaction) => {
					const channelId = ctx.guildEntity.infractionLogId;
					const embed = ctx.embedify('info', 'user', `The current infraction log is <#${channelId}>.`);
					await interaction.update({ embeds: [embed], components: [] });
				}),
			new ExecutionBuilder()
				.setName('Set')
				.setValue('set')
				.setDescription('Set the infraction log')
				.setExecution(async (ctx, interaction) => {
					await interaction.reply({ content: 'Mention a channel', ephemeral: true });
					const msgs = await interaction.channel.awaitMessages({ max: 1, filter: (msg) => msg.author.id === ctx.interaction.user.id });
					const channel = msgs.first().mentions.channels.first() as TextChannel;
					if (!channel) {
						await interaction.followUp({ content: 'Could not find mention', ephemeral: true });
					} else if (!channel.permissionsFor(ctx.interaction.guild.members.me).has('SendMessages') || !channel.permissionsFor(ctx.interaction.guild.members.me).has('EmbedLinks')) {
						const embed = ctx.embedify('error', 'user', 'I need `SEND_MESSAGES` and `EMBED_LINKS` permissions in that channel.');
						await interaction.followUp({ embeds: [embed], components: [] });
					} else {
						ctx.guildEntity.infractionLogId = channel.id;
						await ctx.guildEntity.save();
						const embed = ctx.embedify('success', 'user', `Infraction log set to ${channel}.`);
						await interaction.followUp({ embeds: [embed], components: [] });
					}
				}),
			new ExecutionBuilder()
				.setName('Reset')
				.setValue('reset')
				.setDescription('Reset the infraction log')
				.setExecution(async (ctx, interaction) => {
					ctx.guildEntity.infractionLogId = null;
					await ctx.guildEntity.save();
					const embed = ctx.embedify('info', 'user', 'Infraction log reset.');
					await interaction.update({ embeds: [embed], components: [] });
				}),
		]);
}
