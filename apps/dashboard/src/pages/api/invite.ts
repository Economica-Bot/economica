import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '../../env.mjs';
import {
	OAuth2Scopes,
	PermissionFlagsBits,
	RouteBases,
	Routes
} from 'discord-api-types/v10';
import { makeURLSearchParams } from '@discordjs/rest';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const query = makeURLSearchParams({
		client_id: env.DISCORD_CLIENT_ID,
		scope: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands].join(' ')
	});

	const guildId = req.query.guildId;
	if (guildId && typeof guildId === 'string') query.set('guild_id', guildId);

	const permissions = [
		PermissionFlagsBits.ViewChannel,
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
		PermissionFlagsBits.BanMembers,
		PermissionFlagsBits.ModerateMembers,
		PermissionFlagsBits.ManageMessages,
		PermissionFlagsBits.UseExternalEmojis
	];
	query.set('permissions', permissions.reduce((a, b) => a | b, 0n).toString());

	res.redirect(`${RouteBases.api}${Routes.oauth2Authorization()}?${query}`);
}
