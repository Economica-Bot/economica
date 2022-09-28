import { EmbedBuilder } from '@discordjs/builders';
import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	APIApplicationCommandInteractionDataChannelOption,
	APIApplicationCommandInteractionDataIntegerOption,
	APIChatInputApplicationCommandInteraction,
	ChannelType,
	InteractionResponseType,
	PermissionFlagsBits,
	RESTGetAPIChannelMessagesResult,
	Routes,
} from 'discord-api-types/v10';
import { Router } from 'express';

import { Command, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('purge')
		.setDescription('Delete messages in a channel')
		.setModule('UTILITY')
		.setFormat('purge [channel] [amount]')
		.setExamples(['purge', 'purge #general', 'purge #general 50'])
		.setClientPermissions(PermissionFlagsBits.ManageMessages)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addChannelOption((option) => option
			.setName('channel')
			.setDescription('Specify a channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(false))
		.addIntegerOption((option) => option
			.setName('amount')
			.setDescription('Specify an amount (default 100).')
			.setMinValue(1)
			.setMaxValue(100)
			.setRequired(false));

	public execution = Router()
		.use('/', async (req, res) => {
			const interaction = req.body as APIChatInputApplicationCommandInteraction;
			const channel = (interaction.data.options?.find((option) => option.name === 'channel') as APIApplicationCommandInteractionDataChannelOption)?.value ?? interaction.channel_id;
			if (!(BigInt(interaction.app_permissions) & PermissionFlagsBits.ManageMessages)) throw new Error('I need `MANAGE_MESSAGES` in that channel.');
			const amount = (interaction.data.options?.find((option) => option.name === 'amount') as APIApplicationCommandInteractionDataIntegerOption)?.value ?? 100;
			const query = new URLSearchParams({ limit: amount.toString() });
			const raw = await res.locals.client.rest.get(`${Routes.channelMessages(channel)}?${query}`) as RESTGetAPIChannelMessagesResult;
			const messages = raw
				.filter((msg) => Date.now() - DiscordSnowflake.timestampFrom(msg.id) < 1000 * 60 * 60 * 24 * 14)
				.map((msg) => msg.id);
			if (messages.length < 2) throw new Error('Too few messages to delete.');
			await req.ctx.client.rest.post(
				Routes.channelBulkDelete(channel),
				{ body: { messages } },
			);
			const embed = new EmbedBuilder()
				.setTitle('Purging messages...')
				.setDescription(`Deleted \`${messages.length}\` messages.`);
			res.send({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					embeds: [embed.toJSON()],
				},
			});
		});
}
