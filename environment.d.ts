import { Snowflake } from "discord.js";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_TOKEN: string;
			OWNER_IDS: string;
			DEVELOPER_IDS: string;
			DEVELOPMENT_GUILD_IDS: string;
			PUBLIC_GUILD_ID: Snowflake;
			DISCORD_INVITE_URL: string;
			WEBHOOK_URLS: string;
			PRODUCTION: string;
			DEBUG: string;
			MONGO_URI: string;
			CURRENCY_SYMBOL: string;
			DEV_COOLDOWN_EXEMPT: string;
			DEV_PERMISSION_EXEMPT: string;
			WEBSITE_URL: string | null;
			ACTIVITY_NAME: string | null;
			ACTIVITY_TYPE: string | null;
		}
	}
}

export {}