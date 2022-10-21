import { publicProcedure, router } from '../trpc';

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

import { z } from 'zod';
import { bot } from '..';

export const discordRouter = router({
	user: publicProcedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await bot.rest.get(Routes.user(input))) as RESTGetAPIUserResult
		),
	guild: publicProcedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await bot.rest.get(Routes.guild(input))) as RESTGetAPIGuildResult
		),
	guildChannels: publicProcedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await bot.rest.get(
					Routes.guildChannels(input)
				)) as RESTGetAPIGuildChannelsResult
		),
	guildRoles: publicProcedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await bot.rest.get(
					Routes.guildRoles(input)
				)) as RESTGetAPIGuildRolesResult
		),
	guildEmojis: publicProcedure
		.input(z.string())
		.query(
			async ({ input }) =>
				(await bot.rest.get(
					Routes.guildEmojis(input)
				)) as RESTGetAPIGuildEmojisResult
		),
	guildEmoji: publicProcedure
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
			return (await bot.rest.get(
				Routes.guildEmoji(input.guildId, emojiId)
			)) as RESTGetAPIGuildEmojiResult;
		}),
	member: publicProcedure
		.input(z.object({ guildId: z.string(), userId: z.string() }))
		.query(
			async ({ input }) =>
				(await bot.rest.get(
					Routes.guildMember(input.guildId, input.userId)
				)) as RESTGetAPIGuildMemberResult
		)
});
