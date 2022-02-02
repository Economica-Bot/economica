import { Client, Collection, MessageEmbed, WebhookClient } from 'discord.js';
import { readdirSync } from 'fs';
import { connect, disconnect } from 'mongoose';
import path from 'path';
import { Logger } from 'tslog';

import { EconomicaCommand, EconomicaEvent, EconomicaService, EconomicaSlashCommandBuilder } from '.';
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
	loggerOptions,
	MONGO_URI,
	mongoOptions,
	PUBLIC_GUILD_ID,
	SERVICE_COOLDOWNS,
	WEBHOOK_URLS,
	PRODUCTION,
} from '../config';

export class EconomicaClient extends Client {
	public commands: Collection<string, EconomicaCommand>;
	public webhooks: WebhookClient[];
	public services: Collection<string, EconomicaService>;
	public log: Logger;

	public constructor() {
		super(clientOptions);
		this.commands = new Collection<string, EconomicaCommand>();
		this.webhooks = [];
		this.services = new Collection<string, EconomicaService>();
		this.log = new Logger(loggerOptions);
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
			this.log.info(`${this.user.username} logged in`);
		});
	}

	private async validateSettings(): Promise<void> {
		// BOT_TOKEN
		this.log.debug('Validating BOT_TOKEN');
		const token = BOT_TOKEN;
		const testClient = new Client({
			intents: [],
			presence: { activities: [{ name: ACTIVITY_NAME, type: ACTIVITY_TYPE }] },
		});

		await testClient.login(token).catch((err) => {
			testClient.destroy();
			this.log.fatal(new Error(err));
			process.exit(1);
		});

		// DEVELOPER_IDS
		this.log.debug('Validating DEVELOPER_IDS');
		for (const DEVELOPER_ID of DEVELOPER_IDS) {
			await testClient.users.fetch(DEVELOPER_ID).catch((err) => {
				this.log.fatal(new Error(err));
				process.exit(1);
			});
		}

		// DEVELOPMENT_GUILD_IDS
		this.log.debug('Validating DEVELOPMENT_GUILD_IDS');
		for (const DEVELOPMENT_GUILD_ID of DEVELOPMENT_GUILD_IDS) {
			const guild = (await testClient.guilds.fetch()).get(DEVELOPMENT_GUILD_ID);
			if (!guild) {
				this.log.fatal(new Error(`The bot is not in a guild with id ${DEVELOPMENT_GUILD_ID}`));
				process.exit(1);
			}
		}

		// PUBLIC_GUILD_ID
		this.log.debug('Validating PUBLIC_GUILD_ID');
		const guild = (await testClient.guilds.fetch()).get(PUBLIC_GUILD_ID);
		if (!guild) {
			this.log.fatal(new Error(`The bot is not in a guild with id ${PUBLIC_GUILD_ID}`));
		}

		// DISCORD_INVITE_URL
		this.log.debug('Validating DISCORD_INVITE_URL');
		try {
			const url = new URL(DISCORD_INVITE_URL);
			if (url.toString() !== DISCORD_INVITE_URL) {
				this.log.fatal(new Error(`Could not validate URL ${url}`));
				process.exit(1);
			}
		} catch (_) {
			this.log.fatal(new Error(`Invalid URL ${DISCORD_INVITE_URL}`));
			process.exit(1);
		}

		// WEBHOOK_URLS
		this.log.debug('Validating WEBHOOK_URLS');
		for (const WEBHOOK_URL of WEBHOOK_URLS) {
			const webhookClient = new WebhookClient({ url: WEBHOOK_URL });
			if (!webhookClient) {
				this.log.fatal(new Error(`Could not create Webhook with URL ${WEBHOOK_URL}`));
				process.exit(1);
			}
		}

		// MONGO_URI
		this.log.debug('Validating MONGO_URI');
		await connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
			.then(async () => await disconnect())
			.catch((err) => {
				this.log.fatal(new Error('Could not connect to mongo'));
			});

		testClient.destroy();
		this.log.info('Settings validated');
	}

	private async initWebHooks(): Promise<void> {
		this.log.debug('Initializing webhooks');
		WEBHOOK_URLS.forEach((WEBHOOK_URL) => {
			this.webhooks.push(new WebhookClient({ url: WEBHOOK_URL }));
		});
		this.log.info('Webhooks initialized');
	}

	private async errorHandler(): Promise<void> {
		process.on('unhandledRejection', async (err: Error) => await this.unhandledRejection(err));
		process.on('uncaughtException', async (err, origin) => await this.uncaughtException(err, origin));
	}

	private async unhandledRejection(err: Error): Promise<void> {
		if (DEBUG) {
			this.log.fatal(err);
			process.exit(1);
		} else {
			this.log.error(err);
		}

		const description = '```ts\n' + err.stack + '```';
		const embed = new MessageEmbed()
			.setColor('DARK_ORANGE')
			.setAuthor({ name: 'Unhandled Rejection' })
			.setDescription(description)
			.setTimestamp();
		this.webhooks.forEach(
			async (webhook) => await webhook.send({ embeds: [embed] }).catch((err) => this.log.error(err))
		);
	}

	private async uncaughtException(err: Error, origin: string) {
		this.log.fatal(err);
		const embed = new MessageEmbed()
			.setColor('RED')
			.setAuthor({ name: 'CRITICAL | Uncaught Exception' })
			.setDescription(`Caught exception: ${err}\nException origin: ${origin}`)
			.setTimestamp();
		this.webhooks.forEach((webhook) => webhook.send({ embeds: [embed] }).catch((err) => this.log.error(err)));
		if (DEVELOPMENT) process.exit(1);
	}

	private async connectMongo() {
		this.log.debug('Connecting to Mongo');
		await connect(MONGO_URI, mongoOptions);
		this.log.info('Connected to Mongo');
	}

	private async registerEvents() {
		this.log.debug('Registering events');
		const eventFiles = readdirSync(path.join(__dirname, '../events'));
		for (const eventFile of eventFiles) {
			const event = new (await import(`../events/${eventFile}`)).default() as EconomicaEvent;
			this.log.debug(`Loading event ${event.name}`);
			this.on(event.name, async (...args) => {
				await event.execute(this, ...args);
			});
		}

		this.log.info('Events loaded');
	}

	public async registerCommands() {
		this.log.debug('Registering commands');
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

				this.log.debug(`Registering command ${data.name}`);
				this.commands.set(data.name, command);
			}
		}

		this.log.info('Commands registered.');
	}

	private async runServices() {
		this.log.info('Loading services');
		const serviceFiles = readdirSync(path.join(__dirname, '../services')).sort();
		for (const file of serviceFiles) {
			this.log.debug(`Loading service ${file}`);
			const service = new (await import(`../services/${file}`)).default() as EconomicaService;
			this.services.set(service.name, service);
		}

		this.log.info('Services loaded');

		for (const [name, service] of this.services) {
			const cooldown = PRODUCTION ? service.cooldown : SERVICE_COOLDOWNS.DEV;
			setInterval(async () => {
				this.log.info('Executing service ' + name);
				await service.execute(this);
			}, cooldown);
		}
	}
}
