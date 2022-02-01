import { Client, Collection, MessageEmbed, WebhookClient } from 'discord.js';
import { readdirSync } from 'fs';
import { connect, disconnect } from 'mongoose';
import path from 'path';

import { EconomicaCommand, EconomicaService, EconomicaSlashCommandBuilder } from '.';
import {
	ACTIVITY_NAME,
	ACTIVITY_TYPE,
	BOT_TOKEN,
	clientOptions,
	DEBUG,
	DEVELOPER_IDS,
	DEVELOPMENT,
	DEVELOPMENT_GUILD_IDS,
	DISCORD_INVITE_URL,
	MONGO_URI,
	mongoOptions,
	PUBLIC_GUILD_ID,
	SERVICE_COOLDOWNS,
	WEBHOOK_URLS,
} from '../config';

export class EconomicaClient extends Client {
	commands: Collection<String, EconomicaCommand>;
	webhooks: WebhookClient[];
	services: EconomicaService[];
	constructor() {
		super(clientOptions);
		this.commands = new Collection<String, EconomicaCommand>();
		this.webhooks = [];
		this.services = [];
	}

	public async init() {
		await this.validateSettings();
		await this.initWebHooks();
		await this.errorHandler();
		await this.connectMongo();
		await this.registerEvents();
		await this.registerCommands();
		await this.runServices();
		await this.login(BOT_TOKEN).then(() => {
			console.log(`${this.user.username} logged in`);
		});
	}

	private async validateSettings() {
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
	}

	private async initWebHooks() {
		WEBHOOK_URLS.forEach((WEBHOOK_URL) => {
			this.webhooks.push(new WebhookClient({ url: WEBHOOK_URL }));
		});
	}

	private async errorHandler() {
		process.on('unhandledRejection', async (err: Error) => await this.unhandledRejection(err));
		process.on('uncaughtException', async (err, origin) => await this.uncaughtException(err, origin));
	}

	private async unhandledRejection(err: Error) {
		if (DEBUG) {
			console.error(err);
			process.exit(1);
		}

		const description = '```ts\n' + err.stack + '```';
		const embed = new MessageEmbed()
			.setColor('DARK_ORANGE')
			.setAuthor({ name: 'Unhandled Rejection' })
			.setDescription(description)
			.setTimestamp();
		this.webhooks.forEach(async (webhook) => await webhook.send({ embeds: [embed] }));
	}

	private async uncaughtException(err: Error, origin: string) {
		console.error(err);
		const embed = new MessageEmbed()
			.setColor('RED')
			.setAuthor({ name: 'CRITICAL | Uncaught Exception' })
			.setDescription(`Caught exception: ${err}\nException origin: ${origin}`)
			.setTimestamp();
		this.webhooks.forEach((webhook) => webhook.send({ embeds: [embed] }).catch);
		if (DEVELOPMENT) process.exit(1);
	}

	private async connectMongo() {
		connect(MONGO_URI, mongoOptions);
	}

	private async registerEvents() {
		const eventFiles = readdirSync(path.join(__dirname, '../events'));
		eventFiles.forEach(async (file: string) => {
			const event = require(`../events/${file}`);
			this.on(event.name, async (...args) => {
				await event.execute(this, ...args);
			});

			console.log(`Loading event ${event.name}`);
		});
	}

	public async registerCommands() {
		const commandDirectories = readdirSync(path.join(__dirname, '../commands'));
		for (const commandDirectory of commandDirectories) {
			const commandFiles = readdirSync(path.join(__dirname, `../commands/${commandDirectory}/`));
			for (const commandFile of commandFiles) {
				const command = new (
					await import(`../commands/${commandDirectory}/${commandFile}`)
				).default() as EconomicaCommand;
				const data = command.data as EconomicaSlashCommandBuilder;

				if (!data.group) {
					throw new Error(`Command ${data.name} missing group!`);
				}

				this.commands.set(data.name, command);
				console.log(`Loaded command ${data.name}`);
			}
		}
	}

	private async runServices() {
		const serviceFiles = readdirSync(path.join(__dirname, '../services')).sort();
		for (const file of serviceFiles) {
			const service = new (await import(`../services/${file}`)).default() as EconomicaService;
			this.services.push(service);
		}

		this.services.forEach((service) => {
			setInterval(
				async () => {
					console.log('Executing service ' + service.name);
					await service.execute(this);
				},
				DEVELOPMENT ? SERVICE_COOLDOWNS.DEV : service.cooldown
			);
		});
	}
}
