import axios from 'axios';
import { APIGuild, PermissionFlagsBits } from 'discord-api-types/v9';

import { Guild, Token } from '../../entities/index.js';
import { DISCORD_API_URL } from '../../typings/index.js';

export function getBotsGuildsService() {
	return axios.get<Guild[]>(`${DISCORD_API_URL}/users/@me/guilds`, {
		headers: {
			Authorization: `Bot ${process.env.BOT_TOKEN}`,
		},
	});
}

export async function getUserGuildsService(id: string) {
	const user = await Token.findOne({ where: { id } });
	if (!user) throw new Error('User not found');
	return axios.get<APIGuild[]>(`${DISCORD_API_URL}/users/@me/guilds`, {
		headers: {
			Authorization: `Bearer ${user.accessToken}`,
		},
	});
}

export async function getMenuGuildsService(id: string) {
	const { data: botGuilds } = await getBotsGuildsService();
	const { data: userGuilds } = await getUserGuildsService(id);
	const menuGuilds = userGuilds.filter((guild) => {
		const permissions = BigInt(guild.permissions);
		return (
			// eslint-disable-next-line no-bitwise
			(permissions & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator
			&& botGuilds.some((botGuild) => botGuild.id === guild.id)
		);
	});
	return menuGuilds;
}
