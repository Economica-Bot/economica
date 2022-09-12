import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v10';
import { GetServerSidePropsContext } from 'next';

export const validateCookies = (ctx: GetServerSidePropsContext) => {
	const sessionId = ctx.req.cookies['connect.sid'];
	return sessionId ? { Cookie: `connect.sid=${sessionId}` } : false;
};

export const getIcon = (guild?: RESTAPIPartialCurrentUserGuild) => (!guild || !guild.icon
	? '/discordlogo.jpg'
	: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`);
