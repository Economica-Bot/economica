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
			console.error(err);
			testClient.destroy();
			process.exit(1);
		});

		// DEVELOPER_IDS
		console.info('Validating DEVELOPER_IDS...');
		for (const DEVELOPER_ID of DEVELOPER_IDS) {
			await testClient.users.fetch(DEVELOPER_ID).catch((err) => {
				console.error(err);
				process.exit(1);
			});
		}

		// DEVELOPMENT_GUILD_IDS
		console.info('Validating DEVELOPMENT_GUILD_IDS...');
		for (const DEVELOPMENT_GUILD_ID of DEVELOPMENT_GUILD_IDS) {
			const guild = (await testClient.guilds.fetch()).get(DEVELOPMENT_GUILD_ID);
			if (!guild) {
				console.error(`The bot is not in a guild with id ${DEVELOPMENT_GUILD_ID}.`);
				process.exit(1);
			}
		}

		// PUBLIC_GUILD_ID
		console.info('Validating PUBLIC_GUILD_ID...');
		const guild = (await testClient.guilds.fetch()).get(PUBLIC_GUILD_ID);
		if (!guild) {
			console.error(`The bot is not in a guild with id ${PUBLIC_GUILD_ID}.`);
			process.exit(1);
		}

		// DISCORD_INVITE_URL
		try {
			const url = new URL(DISCORD_INVITE_URL);
			if (url.toString() !== DISCORD_INVITE_URL) throw Error;
		} catch (_) {
			console.error(`Invalid URL ${DISCORD_INVITE_URL}.`);
			process.exit(1);
		}

		// WEBHOOK_URLS
		console.info('Validating WEBHOOK_URLS...');
		for (const WEBHOOK_URL of WEBHOOK_URLS) {
			const webhookClient = new WebhookClient({ url: WEBHOOK_URL });
			if (!webhookClient) {
				console.error(`Could not create Webhook with URL ${WEBHOOK_URL}.`);
				process.exit(1);
			}
		}

		// MONGO_URI
		console.info('Validating MONGO_URI...');
		await connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).catch((err) => {
			console.error('Could not connect to mongo. Check the MONGO_URI.');
			process.exit(1);
		});
		await disconnect();

		testClient.destroy();
		console.log('Settings validated.');
	};
}
