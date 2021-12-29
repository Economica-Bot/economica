import { ChannelType } from 'discord-api-types';
import { CommandInteraction, GuildTextBasedChannel } from 'discord.js';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
} from '../../structures/index';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('purge')
		.setDescription('Purge messages from a channel.')
		.setGroup('utility')
		.setFormat('[channel] [amount]')
		.setExamples(['purge', 'purge #general', 'purge #general 50'])
		.setGlobal(false)
		.setUserPermissions(['MANAGE_MESSAGES'])
		.setClientPermissions(['MANAGE_MESSAGES'])
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('Specify a channel')
				.addChannelType(0)
				//.addChannelType(ChannelType.GuildText)
				.setRequired(false)
		)
		.addNumberOption((option) =>
			option
				.setName('amount')
				.setDescription('Specify an amount.')
				.setMinValue(1)
				.setMaxValue(100)
				.setRequired(false)
		);
	execute = async (client: EconomicaClient, interaction: CommandInteraction): Promise<any> => {
		const channel = (interaction.options.getChannel('channel') ??
			interaction.channel) as GuildTextBasedChannel;
		const amount = interaction.options.getNumber('amount') ?? 100;
		await channel.bulkDelete(amount, true).then(async (count) => {
			interaction.reply(`Deleted \`${count.size}\` messages.`);
		});
	};
}
