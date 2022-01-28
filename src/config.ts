import { ClientOptions, ExcludeEnum, Intents, InviteGenerationOptions, Permissions } from 'discord.js';
import { ActivityTypes } from 'discord.js/typings/enums';
import i18n from 'i18n';
import path from 'path';

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

export const economyDefaults = {
	work: {
		min: 100,
		max: 500,
	},
	beg: {
		min: 25,
		max: 125,
		chance: 40,
	},
	crime: {
		min: 300,
		max: 1500,
		chance: 60,
		minfine: 300,
		maxfine: 1500,
	},
	rob: {
		chance: 20,
		minfine: 500,
		maxfine: 2000,
	},
	coinflip: {
		chance: 50,
	},
};

i18n.configure({
	defaultLocale: 'en',
	directory: path.join(__dirname, '../locales'),
	locales: ['en'],
	updateFiles: false,
	objectNotation: true,
});

export default i18n;
