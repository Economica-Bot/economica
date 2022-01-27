import { ClientOptions, ExcludeEnum, Intents, InviteGenerationOptions, Permissions } from 'discord.js';
import { ActivityTypes } from 'discord.js/typings/enums';
import i18n from 'i18n';
import path from 'path';

export const DISCORD_URL = process.env.DISCORD_URL;
export const DEVELOPMENT_GUILD: string[] = JSON.parse(process.env.GUILD_ID);
export const OWNERS: string[] = JSON.parse(process.env.OWNER_ID);
export const PRODUCTION = Boolean(process.env.PRODUCTION);
export const DEVELOPMENT = !PRODUCTION;
export const BOT_LOG_CHANNEL = process.env.BOT_LOG_ID;
export const MONGO_PATH = process.env.MONGO_PATH;
export const WEBSITE_URL = process.env.WEBSITE_URL;
export const ACTIVITY_NAME = process.env.ACTIVITY_NAME;
export const ACTIVITY_TYPE = process.env.ACTIVITY_TYPE as ExcludeEnum<typeof ActivityTypes, 'CUSTOM'>;

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

export const CURRENCY = process.env.CURRENCY_SYMBOL;
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
