import { EmbedBuilder } from '@discordjs/builders';
import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	APIApplicationCommandInteractionDataChannelOption,
	APIApplicationCommandInteractionDataIntegerOption,
	APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	PermissionFlagsBits,
	RESTGetAPIChannelMessagesResult,
	Routes
} from 'discord-api-types/v10';
import { Router } from 'express';

export default Router().use('/', async (req, res) => {
	const interaction = req.body as APIChatInputApplicationCommandInteraction;
	const channel =
		(
			interaction.data.options?.find(
				(option) => option.name === 'channel'
			) as APIApplicationCommandInteractionDataChannelOption
		)?.value ?? interaction.channel_id;
	if (
		!(BigInt(interaction.app_permissions) & PermissionFlagsBits.ManageMessages)
	)
		throw new Error('I need `MANAGE_MESSAGES` in that channel.');
	const amount =
		(
			interaction.data.options?.find(
				(option) => option.name === 'amount'
			) as APIApplicationCommandInteractionDataIntegerOption
		)?.value ?? 100;
	const query = new URLSearchParams({ limit: amount.toString() });
	const raw = (await res.locals.client.rest.get(
		`${Routes.channelMessages(channel)}?${query}`
	)) as RESTGetAPIChannelMessagesResult;
	const messages = raw
		.filter(
			(msg) =>
				Date.now() - DiscordSnowflake.timestampFrom(msg.id) <
				1000 * 60 * 60 * 24 * 14
		)
		.map((msg) => msg.id);
	if (messages.length < 2) throw new Error('Too few messages to delete.');
	await req.ctx.client.rest.post(Routes.channelBulkDelete(channel), {
		body: { messages }
	});
	const embed = new EmbedBuilder()
		.setTitle('Purging messages...')
		.setDescription(`Deleted \`${messages.length}\` messages.`);
	res.send({
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			embeds: [embed.toJSON()]
		}
	});
});
