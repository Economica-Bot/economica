import { t } from '../trpc';

import {
	RESTGetAPIGuildChannelsResult,
	RESTGetAPIGuildEmojiResult,
	RESTGetAPIGuildEmojisResult,
	RESTGetAPIGuildMemberResult,
	RESTGetAPIGuildResult,
	RESTGetAPIGuildRolesResult,
	RESTGetAPIUserResult,
	Routes
} from 'discord-api-types/v10';

import { REST } from '@discordjs/rest';
import { z } from 'zod';

const rest = new REST();

export const discordRouter = t.router({
	user: t.procedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await rest.get(Routes.user(input))) as RESTGetAPIUserResult
		),
	guild: t.procedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await rest.get(Routes.guild(input))) as RESTGetAPIGuildResult
		),
	guildChannels: t.procedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await rest.get(
					Routes.guildChannels(input)
				)) as RESTGetAPIGuildChannelsResult
		),
	guildRoles: t.procedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await rest.get(Routes.guildRoles(input))) as RESTGetAPIGuildRolesResult
		),
	guildEmojis: t.procedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await rest.get(
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
			return (await rest.get(
				Routes.guildEmoji(input.guildId, emojiId)
			)) as RESTGetAPIGuildEmojiResult;
		}),
	member: t.procedure
		.input(z.object({ guildId: z.string(), userId: z.string() }))
		.query(
			async ({ input }) =>
				(await rest.get(
					Routes.guildMember(input.guildId, input.userId)
				)) as RESTGetAPIGuildMemberResult
		)
});
