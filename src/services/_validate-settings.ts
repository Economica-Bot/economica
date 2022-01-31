import { Client, WebhookClient } from 'discord.js';
import { connect, disconnect } from 'mongoose';

import {
	ACTIVITY_NAME,
	ACTIVITY_TYPE,
	BOT_TOKEN,
	DEVELOPER_IDS,
	DEVELOPMENT_GUILD_IDS,
	DISCORD_INVITE_URL,
	MONGO_URI,
	PUBLIC_GUILD_ID,
	WEBHOOK_URLS,
} from '../config';
import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	name = 'validate-settings';
	execute = async (client: EconomicaClient) => {
		console.log(`Executing service ${this.name}`);

		// BOT_TOKEN
		console.info('Validating BOT_TOKEN...');
		const token = BOT_TOKEN;
		const testClient = new Client({
			intents: [],
			presence: { activities: [{ name: ACTIVITY_NAME, type: ACTIVITY_TYPE }] },
		});

		await testClient.login(token).catch((err) => {
			testClient.destroy();
			throw new Error(err);
		});

		// DEVELOPER_IDS
		console.info('Validating DEVELOPER_IDS...');
		for (const DEVELOPER_ID of DEVELOPER_IDS) {
			await testClient.users.fetch(DEVELOPER_ID).catch((err) => {
				throw new Error(err);
			});
		}

		// DEVELOPMENT_GUILD_IDS
		console.info('Validating DEVELOPMENT_GUILD_IDS...');
		for (const DEVELOPMENT_GUILD_ID of DEVELOPMENT_GUILD_IDS) {
			const guild = (await testClient.guilds.fetch()).get(DEVELOPMENT_GUILD_ID);
			if (!guild) {
				throw new Error(`The bot is not in a guild with id ${DEVELOPMENT_GUILD_ID}.`);
			}
		}

		// PUBLIC_GUILD_ID
		console.info('Validating PUBLIC_GUILD_ID...');
		const guild = (await testClient.guilds.fetch()).get(PUBLIC_GUILD_ID);
		if (!guild) {
			throw new Error(`The bot is not in a guild with id ${PUBLIC_GUILD_ID}.`);
		}

		// DISCORD_INVITE_URL
		try {
			const url = new URL(DISCORD_INVITE_URL);
			if (url.toString() !== DISCORD_INVITE_URL) throw Error;
		} catch (_) {
			throw new Error(`Invalid URL ${DISCORD_INVITE_URL}.`);
		}

		// WEBHOOK_URLS
		console.info('Validating WEBHOOK_URLS...');
		for (const WEBHOOK_URL of WEBHOOK_URLS) {
			const webhookClient = new WebhookClient({ url: WEBHOOK_URL });
			if (!webhookClient) {
				throw new Error(`Could not create Webhook with URL ${WEBHOOK_URL}.`);
			}
		}

		// MONGO_URI
		console.info('Validating MONGO_URI...');
		await connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).catch((err) => {
			throw new Error('Could not connect to mongo. Check the MONGO_URI.');
		});
		await disconnect();

		testClient.destroy();
		console.log('Settings validated.');
	};
}
