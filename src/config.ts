/* eslint-disable prefer-destructuring */
import { ClientOptions, ExcludeEnum, Intents, InviteGenerationOptions, Permissions } from 'discord.js';
import dotenv from 'dotenv';

import type { ActivityTypes } from 'discord.js/typings/enums';
import type { ISettingsParam } from 'tslog';

dotenv.config();

// Environment Vars

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const DEVELOPER_IDS: string[] = JSON.parse(process.env.DEVELOPER_IDS);
export const DEVELOPMENT_GUILD_IDS: string[] = JSON.parse(process.env.DEVELOPMENT_GUILD_IDS);
export const PUBLIC_GUILD_ID = process.env.PUBLIC_GUILD_ID;
export const DISCORD_INVITE_URL = process.env.DISCORD_INVITE_URL;
export const WEBHOOK_URIS: string[] = JSON.parse(process.env.WEBHOOK_URIS);
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
export const ACTIVITY_TYPE = process.env.ACTIVITY_TYPE as ExcludeEnum<typeof ActivityTypes, 'CUSTOM'>;

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
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
};

export const inviteOptions: InviteGenerationOptions = {
	scopes: ['bot', 'applications.commands'],
	permissions: [
		Permissions.FLAGS.VIEW_CHANNEL,
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
		Permissions.FLAGS.BAN_MEMBERS,
		Permissions.FLAGS.KICK_MEMBERS,
		Permissions.FLAGS.MODERATE_MEMBERS,
		Permissions.FLAGS.MANAGE_MESSAGES,
		Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
	],
};

export const loggerOptions: ISettingsParam = {
	instanceName: 'Bot',
	overwriteConsole: true,
	dateTimeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	displayInstanceName: true,
	minLevel: DEBUG ? 'silly' : 'info',
};
