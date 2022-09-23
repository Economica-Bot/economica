import { EmbedBuilder } from '@discordjs/builders';
import {
	APIChatInputApplicationCommandInteraction,
	InteractionResponseType,
	OAuth2Routes,
	OAuth2Scopes,
} from 'discord-api-types/v10';
import { Router } from 'express';

import { Command, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite link for Economica')
		.setModule('UTILITY')
		.setFormat('invite');

	public execution: Router = Router()
		.use('/', async (req, res) => {
			const interaction = req.body as APIChatInputApplicationCommandInteraction;
			const query = new URLSearchParams({
				client_id: interaction.application_id,
				scope: [OAuth2Scopes.ApplicationsCommands].join(' '),
			});
			const embed = new EmbedBuilder()
				.setAuthor({ name: 'Invite Economica!' })
				.setDescription(`**Add Economica to your server!**\n[Click Me!](${OAuth2Routes.authorizationURL}?${query} 'Invite Economica')`);
			res.send({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					embeds: [embed.toJSON()],
				},
			});
		});
}
