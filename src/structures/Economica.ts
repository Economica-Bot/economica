import { Client, Collection, MessageEmbed, WebhookClient } from 'discord.js';
import { readdirSync } from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { Logger } from 'tslog';
import { fileURLToPath } from 'url';

import {
	ACTIVITY_NAME,
	ACTIVITY_TYPE,
	BOT_TOKEN,
	DEBUG,
	DEVELOPER_IDS,
	DEVELOPMENT,
	DEVELOPMENT_GUILD_IDS,
	DISCORD_INVITE_URL,
	MONGO_URI,
	PRODUCTION,
	PUBLIC_GUILD_ID,
	WEBHOOK_URLS,
	clientOptions,
	loggerOptions,
	mongoOptions,
} from '../config.js';
import { SERVICE_COOLDOWNS } from '../typings/constants.js';
import { Command } from './Command.js';
import { Service } from './Service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Economica extends Client {
	public commands: Collection<string, Command>;
	public services: Collection<string, Service>;
	public cooldowns: Collection<string, Date>;
	public mongoose: mongoose.Mongoose;
	public webhooks: WebhookClient[];
	public log: Logger;

	public constructor() {
		super(clientOptions);
		this.commands = new Collection<string, Command>();
		this.cooldowns = new Collection<string, Date>();
		this.webhooks = new Array<WebhookClient>();
		this.services = new Collection<string, Service>();
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
		await this.login(BOT_TOKEN);
		this.log.info(`${this.user.username} logged in`);
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
		DEVELOPER_IDS.forEach(async (id) => {
			await testClient.users.fetch(id).catch((err) => {
				this.log.fatal(new Error(err));
				process.exit(1);
			});
		});

		// DEVELOPMENT_GUILD_IDS
		this.log.debug('Validating DEVELOPMENT_GUILD_IDS');
		DEVELOPMENT_GUILD_IDS.forEach(async (id) => {
			const guild = (await testClient.guilds.fetch()).get(id);
			if (!guild) {
				this.log.fatal(new Error(`The bot is not in a guild with id ${id}`));
				process.exit(1);
			}
		});

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
		WEBHOOK_URLS.forEach(async (url) => {
			const webhookClient = new WebhookClient({ url });
			if (!webhookClient) {
				this.log.fatal(new Error(`Could not create Webhook with URL ${url}`));
				process.exit(1);
			}
		});

		// MONGO_URI
		this.log.debug('Validating MONGO_URI');
		try {
			await mongoose.connect(MONGO_URI, mongoOptions);
		} catch {
			this.log.fatal(new Error('Could not connect to mongo'));
		} finally {
			await mongoose.disconnect();
		}

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
		process.on('unhandledRejection', (err: Error) => this.unhandledRejection(err));
		process.on('uncaughtException', (err, origin) => this.uncaughtException(err, origin));
	}

	private async unhandledRejection(err: Error): Promise<void> {
		if (DEBUG) {
			this.log.fatal(err);
			process.exit(1);
		} else {
			this.log.error(err);
		}

		const description = `\`\`\`ts${err.stack}\`\`\``;
		const embed = new MessageEmbed()
			.setColor('DARK_ORANGE')
			.setAuthor({ name: 'Unhandled Rejection' })
			.setDescription(description)
			.setTimestamp();
		this.webhooks.forEach((webhook) => webhook.send({ embeds: [embed] }).catch((e) => this.log.error(e)));
	}

	private async uncaughtException(err: Error, origin: string) {
		this.log.fatal(err);
		const embed = new MessageEmbed()
			.setColor('RED')
			.setAuthor({ name: 'CRITICAL | Uncaught Exception' })
			.setDescription(`Caught exception: ${err}\nException origin: ${origin}`)
			.setTimestamp();
		this.webhooks.forEach((webhook) => webhook.send({ embeds: [embed] }).catch((e) => this.log.error(e)));
		if (DEVELOPMENT) process.exit(1);
	}

	private async connectMongo() {
		this.log.debug('Connecting to Mongo');
		this.mongoose = await mongoose.connect(MONGO_URI, mongoOptions);
		this.log.info('Connected to Mongo');
	}

	private async registerEvents() {
		this.log.debug('Registering events');
		const eventFiles = readdirSync(path.resolve(__dirname, '../events')).filter((file) => file.endsWith('.js') || file.endsWith('.ts'));
		eventFiles.forEach(async (file) => {
			const { default: Event } = await import(`../events/${file}`);
			const event = new Event();
			this.log.debug(`Loading event ${event.event}`);
			this.on(event.event, async (...args) => {
				this.log.debug(`Received event ${event.event}`);
				await event.execute(this, ...args);
			});
		});
		this.log.info('Events loaded');
	}

	public async registerCommands() {
		this.log.debug('Registering commands');
		const dirs = readdirSync(path.resolve(__dirname, '../commands'));
		dirs.forEach((dir) => {
			const files = readdirSync(path.resolve(__dirname, `../commands/${dir}/`)).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
			files.forEach(async (file) => {
				const { default: Command } = await import(`../commands/${dir}/${file}`);
				const command = new Command();
				if (!command.data.module) throw new Error(`Command ${command.data.name} missing module!`);
				this.log.debug(`Registering command ${command.data.name}`);
				this.commands.set(command.data.name, command);
			});
		});
		this.log.info('Commands registered');
	}

	private async runServices() {
		this.log.debug('Loading services');
		const serviceFiles = readdirSync(path.resolve(__dirname, '../services')).filter((file) => file.endsWith('.ts') || file.endsWith('.js')).sort();
		serviceFiles.forEach(async (file) => {
			this.log.debug(`Loading service ${file}`);
			const { default: Service } = await import(`../services/${file}`);
			const service = new Service();
			this.services.set(service.name, service);
		});
		this.log.info('Services loaded');
		this.services.forEach((service) => {
			const cooldown = PRODUCTION ? service.cooldown : SERVICE_COOLDOWNS.DEV;
			setInterval(async () => {
				this.log.info(`Executing service ${service.service}`);
				await service.execute(this);
			}, cooldown);
		});
	}
}
