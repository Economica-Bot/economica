import { Client, Collection, EmbedBuilder, resolveColor, WebhookClient } from 'discord.js';
import { readdirSync, statSync } from 'fs';
import { resolve } from 'path';
import { Logger } from 'tslog';
import { DataSource } from 'typeorm';

import { Command } from '.';
import {
	ACTIVITY_NAME,
	ACTIVITY_TYPE,
	BOT_TOKEN,
	clientOptions,
	databaseOptions,
	DB_OPTION,
	DEBUG,
	DEVELOPER_IDS,
	DEVELOPMENT,
	DEVELOPMENT_GUILD_IDS,
	DISCORD_INVITE_URL,
	loggerOptions,
	PORT,
	PUBLIC_GUILD_ID,
	VALIDATE_SETTINGS,
	WEBHOOK_URIS,
} from '../config';

export class Economica extends Client {
	public commands: Collection<string, Command>;

	public webhooks: WebhookClient[];

	public AppDataSource: DataSource;

	public log: Logger;

	public constructor() {
		super(clientOptions);
		this.commands = new Collection<string, Command>();
		this.webhooks = new Array<WebhookClient>();
		this.log = new Logger(loggerOptions);
	}

	public async init() {
		await this.validateSettings();
		await this.initWebHooks();
		await this.errorHandler();
		await this.connectDB();
		await this.registerEvents();
		await this.registerCommands();
		await this.registerJobs();
		await this.registerAPI();
		await this.login(BOT_TOKEN);
		this.log.info(`${this.user.tag} Initialized`);
		return this;
	}

	private async validateSettings(): Promise<void> {
		if (!VALIDATE_SETTINGS) {
			this.log.info('Skipping validation...');
			return;
		}

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

		// WEBHOOK_URIS
		this.log.debug('Validating WEBHOOK_URIS');
		WEBHOOK_URIS.forEach(async (url) => {
			const webhookClient = new WebhookClient({ url });
			if (!webhookClient) {
				this.log.fatal(new Error(`Could not create Webhook with URL ${url}`));
				process.exit(1);
			}
		});

		testClient.destroy();
		this.log.info('Settings validated');
	}

	private async initWebHooks(): Promise<void> {
		this.log.debug('Initializing webhooks');
		WEBHOOK_URIS.forEach((WEBHOOK_URI) => {
			this.webhooks.push(new WebhookClient({ url: WEBHOOK_URI }));
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
		const embed = new EmbedBuilder()
			.setColor(resolveColor('Blurple'))
			.setAuthor({ name: 'Unhandled Rejection' })
			.setDescription(description)
			.setTimestamp();
		this.webhooks.forEach((webhook) => webhook.send({ embeds: [embed] }).catch((e) => this.log.error(e)));
	}

	private async uncaughtException(err: Error, origin: string) {
		this.log.fatal(err);
		const embed = new EmbedBuilder()
			.setColor(resolveColor('Red'))
			.setAuthor({ name: 'CRITICAL | Uncaught Exception' })
			.setDescription(`Caught exception: ${err}\nException origin: ${origin}`)
			.setTimestamp();
		this.webhooks.forEach((webhook) => webhook.send({ embeds: [embed] }).catch((e) => this.log.error(e)));
		if (DEVELOPMENT) process.exit(1);
	}

	private async connectDB() {
		this.log.debug('Connecting to DB');
		const entityFiles = await import('../entities');
		this.AppDataSource = await new DataSource({
			...databaseOptions,
			entities: Object.values(entityFiles),
		}).initialize();
		if (DB_OPTION === 1) {
			await this.AppDataSource.synchronize();
			this.log.debug('Database synchronized');
		} else if (DB_OPTION === 2) {
			await this.AppDataSource.synchronize(true);
			this.log.debug('Database dropped and synchronized');
		}

		this.log.info('Connected to DB');
	}

	private async registerEvents() {
		this.log.debug('Registering events');
		const eventFiles = await import('../events');
		Object.values(eventFiles).forEach(async (Constructor) => {
			const event = new Constructor();
			this.log.debug(`Loading event ${event.event}`);
			this.on(event.event, async (args) => {
				this.log.debug(`Received event ${event.event}`);
				await event.execute(this, args as any);
			});
		});
		this.log.info('Events loaded');
	}

	private async registerJobs() {
		this.log.debug('Registering jobs');
		const jobFiles = await import('../jobs');
		Object.values(jobFiles).forEach(async (Constructor) => {
			const job = new Constructor();
			this.log.debug(`Loading job ${job.name}`);
			setInterval(async () => {
				this.log.info(`Executing ${job.name}`);
				await job.execute(this);
			}, job.cooldown);
		});
		this.log.info('Jobs registered');
	}

	public findCommands(dir: string) {
		const results: string[] = [];
		readdirSync(dir).forEach((path) => {
			const stat = statSync(resolve(dir, path));
			if (stat.isDirectory()) results.concat(this.findCommands(resolve(dir, path)));
			else if (stat.isFile()) results.push(resolve(dir, path));
		});

		return results;
	}

	public async registerCommands() {
		this.log.debug('Registering commands');

		const files = await import('../commands');
		Object.values(files).forEach(async (Constructor) => {
			const command = new Constructor();

			// Validation
			if (!command.data.module) throw new Error(`Command ${command.data.name} missing module!`);
			if (!command.data.format) throw new Error(`Command ${command.data.name} missing format!`);
			if (!command.data.examples) throw new Error(`Command ${command.data.name} missing examples!`);
			this.log.debug(`Registering command ${command.data.name}`);
			this.commands.set(command.data.name, command);
		});

		this.log.info('Commands registered');
	}

	private async registerAPI() {
		this.log.debug('Registering API...');
		import('../api');
		this.log.info(`API listening on port ${PORT}`);
	}
}
