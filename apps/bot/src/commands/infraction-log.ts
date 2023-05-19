import { datasource, Guild } from '@economica/db';
import { Command } from '../structures/commands';

export const InfractionLog = {
	identifier: /^infraction-log$/,
	type: 'chatInput',
	execute: async ({ interaction, guildEntity }) => {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const channelId = guildEntity.infractionLogId;
			if (channelId)
				await interaction.reply(
					`The current infraction log is <#${channelId}>.`
				);
			else await interaction.reply('There is no infraction log.');
		}
		if (subcommand === 'set') {
			const channel = interaction.options.getChannel('channel', true);
			if (
				!channel
					.permissionsFor(await interaction.guild.members.fetchMe())
					.has(['SendMessages', 'EmbedLinks'])
			)
				throw new Error(
					'I need `SEND_MESSAGES` and `EMBED_LINKS` in that channel.'
				);
			await datasource
				.getRepository(Guild)
				.update({ id: interaction.guildId }, { infractionLogId: channel.id });
			await interaction.reply(`Infraction log set to ${channel}.`);
		}
		if (subcommand === 'reset') {
			await datasource
				.getRepository(Guild)
				.update({ id: interaction.guildId }, { infractionLogId: null });
			await interaction.reply('Infraction log reset.');
		}
	}
} satisfies Command<'chatInput'>;
