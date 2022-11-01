import { REST } from '@discordjs/rest';
import {
	RESTGetAPIGuildChannelsResult,
	RESTGetAPIGuildEmojiResult,
	RESTGetAPIGuildEmojisResult,
	RESTGetAPIGuildMemberResult,
	RESTGetAPIGuildResult,
	RESTGetAPIGuildRolesResult,
	RESTGetAPIUserResult,
	RESTGetAPICurrentUserGuildsResult,
	Routes
} from 'discord-api-types/v10';
import { z } from 'zod';

import { t } from '../trpc';

const botRest = new REST({ authPrefix: 'Bot' });
const userRest = new REST({ authPrefix: 'Bearer' });

export const discordRouter = t.router({
	user: t.procedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await botRest.get(Routes.user(input))) as RESTGetAPIUserResult
		),
	guild: t.procedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await botRest.get(Routes.guild(input))) as RESTGetAPIGuildResult
		),
	guildChannels: t.procedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await botRest.get(
					Routes.guildChannels(input)
				)) as RESTGetAPIGuildChannelsResult
		),
	guildRoles: t.procedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await botRest.get(
					Routes.guildRoles(input)
				)) as RESTGetAPIGuildRolesResult
		),
	guildEmojis: t.procedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await botRest.get(
					Routes.guildEmojis(input)
				)) as RESTGetAPIGuildEmojisResult
		),
	guildEmoji: t.procedure
		.input(
			z.object({
				guildId: z.string(),
				emoji: z.object({
					id: z.string().nullable().default(null),
					name: z.string()
				})
			})
		)
		.query(async ({ input }) => {
			const emojiId = encodeURI(
				JSON.stringify({
					id: input.emoji.id,
					name: input.emoji.name
				})
			);
			return (await botRest.get(
				Routes.guildEmoji(input.guildId, emojiId)
			)) as RESTGetAPIGuildEmojiResult;
		}),
	member: t.procedure
		.input(z.object({ guildId: z.string(), userId: z.string() }))
		.query(
			async ({ input }) =>
				(await botRest.get(
					Routes.guildMember(input.guildId, input.userId)
				)) as RESTGetAPIGuildMemberResult
		),
	userGuilds: t.procedure.input(z.string()).query(async ({ input }) => {
		userRest.setToken(input);
		return (await userRest.get(
			Routes.userGuilds()
		)) as RESTGetAPICurrentUserGuildsResult;
	})
});
