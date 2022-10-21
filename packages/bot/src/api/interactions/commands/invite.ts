import { EmbedBuilder } from '@discordjs/builders';
import { InteractionResponseType, OAuth2Routes } from 'discord-api-types/v10';
import { Router } from 'express';
import { inviteQuery } from '../../../config';

export default Router().use('/', async (req, res) => {
	const embed = new EmbedBuilder()
		.setAuthor({ name: 'Invite Economica!' })
		.setDescription(
			`**Add Economica to your server!**\n[Click Me!](${OAuth2Routes.authorizationURL}?${inviteQuery} 'Invite Economica')`
		);
	res.send({
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			embeds: [embed.toJSON()]
		}
	});
});
