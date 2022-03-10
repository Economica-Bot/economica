import { Client, Collection, MessageEmbed, WebhookClient } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { Logger } from 'tslog';
import { Connection } from 'typeorm';
import { fileURLToPath } from 'url';

import {
	ACTIVITY_NAME,
	ACTIVITY_TYPE,
	BOT_TOKEN,
	DB_OPTION,
	DEBUG,
	DEVELOPER_IDS,
	DEVELOPMENT,
	DEVELOPMENT_GUILD_IDS,
	DISCORD_INVITE_URL,
	PUBLIC_GUILD_ID,
	VALIDATE_SETTINGS,
	WEBHOOK_URIS,
	clientOptions,
	loggerOptions,
} from '../config.js';
import {
	Authority,
	Command,
	Guild,
	Infraction,
	Item,
	Listing,
	Loan,
	Member,
	Module,
	Transaction,
	User,
} from '../entities/index.js';
import { Command as CommandStruct } from './Command.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export class Economica extends Client {
	public commands: Collection<string, CommandStruct<true>>;
	public cooldowns: Collection<string, Date>;
	public webhooks: WebhookClient[];
	public connection: Connection;
	public log: Logger;

	public constructor() {
		super(clientOptions);
		this.commands = new Collection<string, CommandStruct<true>>();
		this.cooldowns = new Collection<string, Date>();
		this.webhooks = new Array<WebhookClient>();
		this.log = new Logger(loggerOptions);
	}

	public async init() {
		if (VALIDATE_SETTINGS) await this.validateSettings();
		await this.initWebHooks();
		await this.errorHandler();
		await this.connectSQL();
		await this.registerEvents();
		await this.registerCommands();
		await this.login(BOT_TOKEN);
		this.log.info(`${this.user.tag} logged in`);
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

	private async connectSQL() {
		this.log.debug('Connecting to DB');
		this.connection = await new Connection({
			type: 'postgres',
			host: 'localhost',
			port: 5432,
			username: 'postgres',
			password: 'password',
			entities: [path.join(dirname, '../entities/*.{js,ts}')],
			applicationName: 'Economica',
		}).connect();
		if (DB_OPTION === 1) {
			await this.connection.synchronize();
			this.log.debug('Database synchronized');
		} else if (DB_OPTION === 2) {
			await this.connection.synchronize(true);
			this.log.debug('Database dropped and synchronized');
		}
		Authority.useConnection(this.connection);
		Command.useConnection(this.connection);
		Guild.useConnection(this.connection);
		Infraction.useConnection(this.connection);
		Item.useConnection(this.connection);
		Listing.useConnection(this.connection);
		Loan.useConnection(this.connection);
		Member.useConnection(this.connection);
		Module.useConnection(this.connection);
		Transaction.useConnection(this.connection);
		User.useConnection(this.connection);
		this.log.info('Connected to DB');
	}

	private async registerEvents() {
		this.log.debug('Registering events');
		const eventFiles = readdirSync(path.resolve(__dirname, '../events')).filter((file) => file.endsWith('.js'));
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
				const { default: CommandClass } = await import(`../commands/${dir}/${file}`);
				const command = new CommandClass() as CommandStruct<true>;

				// Validation
				if (!command.data.module) throw new Error(`Command ${command.data.name} missing module!`);
				if (!command.data.format) throw new Error(`Command ${command.data.name} missing format!`);
				if (!command.data.examples) throw new Error(`Command ${command.data.name} missing examples!`);
				this.log.debug(`Registering command ${command.data.name}`);
				this.commands.set(command.data.name, command);
			});
		});
		this.log.info('Commands registered');
	}
}
