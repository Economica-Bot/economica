/* eslint-disable prefer-destructuring */
import {
	ActivityType,
	ClientOptions,
	GatewayIntentBits,
	InviteGenerationOptions,
	OAuth2Scopes,
	Partials,
	PermissionFlagsBits,
} from 'discord.js';
import 'dotenv/config';
import path from 'path';
import type { ISettingsParam } from 'tslog';
import { DataSourceOptions } from 'typeorm';
import { fileURLToPath } from 'url';

// Environment Vars

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const PORT = +process.env.PORT;
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const CALLBACK_URL = process.env.CALLBACK_URL;
export const SECRET = process.env.SECRET;
export const DEVELOPER_IDS: string[] = JSON.parse(process.env.DEVELOPER_IDS);
export const DEVELOPMENT_GUILD_IDS: string[] = JSON.parse(process.env.DEVELOPMENT_GUILD_IDS);
export const PUBLIC_GUILD_ID = process.env.PUBLIC_GUILD_ID;
export const DISCORD_INVITE_URL = process.env.DISCORD_INVITE_URL;
export const WEBHOOK_URIS: string[] = JSON.parse(process.env.WEBHOOK_URIS);
export const DEPLOY_COMMANDS = +process.env.DEPLOY_COMMANDS;
export const DEPLOY_ALL_MODULES = +process.env.DEPLOY_ALL_MODULES;
export const DB_OPTION = +process.env.DB_OPTION;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const VALIDATE_SETTINGS = process.env.VALIDATE_SETTINGS === 'true';
export const PRODUCTION = process.env.PRODUCTION === 'true';
export const DEVELOPMENT = !PRODUCTION;
export const DEBUG = process.env.DEBUG === 'true';
export const CURRENCY_SYMBOL = process.env.CURRENCY_SYMBOL;

// Exemptions

export const DEV_COOLDOWN_EXEMPT = process.env.DEV_COOLDOWN_EXEMPT === 'true';
export const DEV_PERMISSION_EXEMPT = process.env.DEV_PERMISSION_EXEMPT === 'true';
export const DEV_MODULE_EXEMPT = process.env.DEV_MODULE_EXEMPT === 'true';

// Optional

export const WEBSITE_HOME_URL = process.env.WEBSITE_HOME_URL;
export const WEBSITE_COMMANDS_URL = process.env.WEBSITE_COMMANDS_URL;
export const WEBSITE_DOCS_URL = process.env.WEBSITE_DOCS_URL;
export const WEBSITE_VOTE_URL = process.env.WEBSITE_VOTE_URL;

export const ACTIVITY_NAME = process.env.ACTIVITY_NAME;
export const ACTIVITY_TYPE = +process.env.ACTIVITY_TYPE as Exclude<ActivityType, ActivityType.Custom>;

// Configurations

export const clientOptions: ClientOptions = {
	presence: {
		activities: [
			{
				name: ACTIVITY_NAME,
				type: ACTIVITY_TYPE,
				url: WEBSITE_HOME_URL,
			},
		],
	},
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
	],
	partials: [
		Partials.Channel,
		Partials.GuildMember,
	],
};

export const inviteOptions: InviteGenerationOptions = {
	scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
	permissions: [
		PermissionFlagsBits.ViewChannel,
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
		PermissionFlagsBits.BanMembers,
		PermissionFlagsBits.ModerateMembers,
		PermissionFlagsBits.ManageMessages,
		PermissionFlagsBits.UseExternalEmojis,
	],
};

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const databaseOptions: DataSourceOptions = {
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'postgres',
	password: DB_PASSWORD,
	entities: [path.resolve(dirname, './entities/*.{ts,js}')],
	database: 'postgres',
};

export const loggerOptions: ISettingsParam = {
	instanceName: 'Bot',
	overwriteConsole: true,
	dateTimeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	displayInstanceName: true,
	minLevel: DEBUG ? 'silly' : 'info',
};
