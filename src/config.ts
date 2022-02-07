import { ClientOptions, ColorResolvable, ExcludeEnum, Intents, InviteGenerationOptions, Permissions } from 'discord.js';
import { ActivityTypes } from 'discord.js/typings/enums';
import * as i18n from 'i18n';
import { ConnectOptions } from 'mongoose';
import path from 'path';
import { ISettingsParam } from 'tslog';

import { IncomeCommand, ReplyString } from './typings';

// Required
export const BOT_TOKEN = process.env.ECON_ALPHA_TOKEN;
export const DEVELOPER_IDS: string[] = JSON.parse(process.env.DEVELOPER_IDS);
export const DEVELOPMENT_GUILD_IDS: string[] = JSON.parse(process.env.DEVELOPMENT_GUILD_IDS);
export const PUBLIC_GUILD_ID = process.env.PUBLIC_GUILD_ID;
export const DISCORD_INVITE_URL = process.env.DISCORD_INVITE_URL;
export const WEBHOOK_URLS: string[] = JSON.parse(process.env.WEBHOOK_URLS);
export const PRODUCTION = process.env.PRODUCTION === 'true';
export const DEVELOPMENT = !PRODUCTION;
export const DEBUG = process.env.DEBUG === 'true';
export const MONGO_URI = process.env.MONGO_URI;
export const CURRENCY_SYMBOL = process.env.CURRENCY_SYMBOL;

// Optional
export const WEBSITE_URL = process.env.WEBSITE_URL;
export const ACTIVITY_NAME = process.env.ACTIVITY_NAME;
export const ACTIVITY_TYPE = process.env.ACTIVITY_TYPE as ExcludeEnum<typeof ActivityTypes, 'CUSTOM'>;

// Constants
export const clientOptions: ClientOptions = {
	presence: {
		activities: [
			{
				name: ACTIVITY_NAME,
				type: ACTIVITY_TYPE,
				url: WEBSITE_URL,
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

export const mongoOptions: ConnectOptions = {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useFindAndModify: false,
};

export const loggerOptions: ISettingsParam = {
	instanceName: 'Economica_Bot',
	overwriteConsole: true,
	dateTimeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	displayInstanceName: true,
	minLevel: DEBUG ? 'silly' : 'info',
};

export enum SERVICE_COOLDOWNS {
	DEV = 1000 * 10,
	UPDATE_BANS = 1000 * 60 * 5,
	UPDATE_BOT_LOG = 1000 * 60 * 10,
	UPDATE_GENERATORS = 1000 * 60 * 5,
	UPDATE_LOANS = 1000 * 60 * 5,
	UPDATE_SHOP = 1000 * 60 * 5,
}

export const EmbedColors: Record<ReplyString, ColorResolvable> = {
	success: 'GREEN',
	info: 'BLURPLE',
	warn: 'YELLOW',
	error: 'RED',
};

export const hyperlinks = {
	help: '[Help Me Understand](https://discord.gg/57rQ7aHTpX)',
	bug: '[Report An Issue](https://discord.gg/qEXKFth3vY)',
	suggest: '[Suggest An Improvement](https://discord.gg/Rez4Etbf9X)',
	insertAll: () => `${hyperlinks.help}\n${hyperlinks.bug}\n${hyperlinks.suggest}`,
};

export const icons = {
	success: 'https://cdn.discordapp.com/emojis/843390419261194300.webp?size=96&quality=lossless',
	info: 'https://cdn.discordapp.com/emojis/843390419429883924.webp?size=96&quality=lossless',
	warning: 'https://cdn.discordapp.com/emojis/843390419270107136.webp?size=96&quality=lossless',
	abort: 'https://cdn.discordapp.com/emojis/843390419270107136.webp?size=96&quality=lossless',
	error: 'https://cdn.discordapp.com/emojis/843390419303661569.webp?size=96&quality=lossless',
};

export const authors = {
	success: {
		name: 'Process Executed Successfully',
		iconURL: icons.success,
	},
	warning: {
		name: 'Process Executed With Issues',
		iconURL: icons.warning,
	},
	abort: {
		name: 'Process Aborted',
		iconURL: icons.abort,
	},
	error: {
		name: 'Process Error',
		iconURL: icons.error,
	},
};

export type defaultIncomes = { work: IncomeCommand; beg: IncomeCommand; crime: IncomeCommand; rob: IncomeCommand };

export type defaultModule =
	| 'APPLICATION'
	| 'ADMIN'
	| 'ECONOMY'
	| 'INCOME'
	| 'MODERATION'
	| 'SHOP'
	| 'STATISTICS'
	| 'UTILITY';
export type specialModule = 'TESTMODULE';
export type Module = defaultModule | specialModule;

i18n.configure({
	defaultLocale: 'en',
	directory: path.join(__dirname, '../locales'),
	locales: ['en'],
	updateFiles: false,
	objectNotation: true,
});

export { i18n };
