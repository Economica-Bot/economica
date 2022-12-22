import { datasource, Guild } from '@economica/db';
import { Command } from '../structures/commands';

export const TransactionLog = {
	identifier: /^transaction-log$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const guildEntity = await datasource
			.getRepository(Guild)
			.findOneByOrFail({ id: interaction.guildId });
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'view') {
			const channelId = guildEntity.transactionLogId;
			if (channelId)
				await interaction.reply(
					`The current transaction log is <#${channelId}>.`
				);
			else await interaction.reply('There is no transaction log.');
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
				.update({ id: interaction.guildId }, { transactionLogId: channel.id });
			await interaction.reply(`Transaction log set to ${channel}.`);
		}
		if (subcommand === 'reset') {
			await datasource
				.getRepository(Guild)
				.update({ id: interaction.guildId }, { transactionLogId: null });
			await interaction.reply('Transaction log reset.');
		}
	}
} satisfies Command<'chatInput'>;
