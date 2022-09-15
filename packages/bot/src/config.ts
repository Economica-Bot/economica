/* eslint-disable no-tabs */
/* eslint-disable prefer-destructuring */
import 'reflect-metadata';

import { RESTOptions } from '@discordjs/rest';
import { config } from 'dotenv';
import path from 'path';
import { DataSourceOptions } from 'typeorm';

import type { ISettingsParam } from 'tslog';

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
	config({ path: `${path.join(process.cwd(), '../../.env.development')}` });
}

// Environment Vars

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const PUB_KEY = process.env.PUB_KEY;
export const PORT = +(process.env.PORT ?? 3000);
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const CALLBACK_URL = process.env.CALLBACK_URL;
export const SECRET = process.env.SECRET;
export const DEVELOPER_IDS: string[] = JSON.parse(process.env.DEVELOPER_IDS ?? '');
export const DEVELOPMENT_GUILD_IDS: string[] = JSON.parse(process.env.DEVELOPMENT_GUILD_IDS ?? '');
export const PUBLIC_GUILD_ID = process.env.PUBLIC_GUILD_ID;
export const DISCORD_INVITE_URL = process.env.DISCORD_INVITE_URL;
// export const WEBHOOK_URIS: string[] = JSON.parse(process.env.WEBHOOK_URIS ?? '');
export const DEPLOY_COMMANDS = +(process.env.DEPLOY_COMMANDS ?? 0);
export const DEPLOY_ALL_MODULES = +(process.env.DEPLOY_ALL_MODULES ?? 0);
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = +(process.env.DB_PORT ?? 5432);
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const DB_OPTION = +(process.env.DB_OPTION ?? 0);
// export const VALIDATE_SETTINGS = process.env.VALIDATE_SETTINGS === 'true';
export const PRODUCTION = process.env.NODE_ENV === 'production';
export const DEVELOPMENT = !PRODUCTION;
export const DEBUG = process.env.DEBUG === 'true';

// Exemptions

export const DEV_COOLDOWN_EXEMPT = process.env.DEV_COOLDOWN_EXEMPT === 'true';
export const DEV_MODULE_EXEMPT = process.env.DEV_MODULE_EXEMPT === 'true';

// Optional

export const WEBSITE_HOME_URL = process.env.WEBSITE_HOME_URL;
export const WEBSITE_COMMANDS_URL = process.env.WEBSITE_COMMANDS_URL;
export const WEBSITE_DOCS_URL = process.env.WEBSITE_DOCS_URL;
export const WEBSITE_VOTE_URL = process.env.WEBSITE_VOTE_URL;

// export const ACTIVITY_NAME = process.env.ACTIVITY_NAME;
// export const ACTIVITY_TYPE = +(process.env.ACTIVITY_TYPE ?? 0) as Exclude<ActivityType, ActivityType.Custom>;

// Configurations

export const restOptions: Partial<RESTOptions> = {
};

// export const clientOptions: ClientSessionOptions = {
// 	presence: {
// 		activities: [
// 			{
// 				name: ACTIVITY_NAME,
// 				type: ACTIVITY_TYPE,
// 				url: WEBSITE_HOME_URL,
// 			},
// 		],
// 	},
// 	intents: [
// 		GatewayIntentBits.Guilds,
// 		GatewayIntentBits.GuildMembers,
// 		GatewayIntentBits.MessageContent,
// 		GatewayIntentBits.GuildMessages,
// 	],
// 	partials: [Partials.Channel, Partials.GuildMember, Partials.Message],
// };

// export const inviteOptions: InviteGenerationOptions = {
// 	scopes: [OAuth2Scopes.ApplicationsCommands],
// 	permissions: [
// 		PermissionFlagsBits.ViewChannel,
// 		PermissionFlagsBits.SendMessages,
// 		PermissionFlagsBits.EmbedLinks,
// 		PermissionFlagsBits.BanMembers,
// 		PermissionFlagsBits.ModerateMembers,
// 		PermissionFlagsBits.ManageMessages,
// 		PermissionFlagsBits.UseExternalEmojis,
// 	],
// };

export const databaseOptions: DataSourceOptions = {
	type: 'postgres',
	host: DB_HOST,
	port: DB_PORT,
	username: DB_USERNAME,
	password: DB_PASSWORD,
	database: DB_NAME,
	logging: ['info', 'log', 'warn', 'error'],
};

export const loggerOptions: ISettingsParam = {
	overwriteConsole: true,
	displayFilePath: 'displayAll',
	displayFunctionName: false,
	dateTimeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	minLevel: DEBUG ? 'silly' : 'info',
};
