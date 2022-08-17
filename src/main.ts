// /$$$$$$$$$                                                       /$$
// | $$_____/                                                      |__/
// | $$        /$$$$$$$  /$$$$$$  /$$$$$$$   /$$$$$$  /$$$$$$/$$$$  /$$  /$$$$$$$  /$$$$$$
// | $$$$$    /$$_____/ /$$__  $$| $$__  $$ /$$__  $$| $$_  $$_  $$| $$ /$$_____/ |____  $$
// | $$__/   | $$      | $$  \ $$| $$  \ $$| $$  \ $$| $$ \ $$ \ $$| $$| $$        /$$$$$$$
// | $$      | $$      | $$  | $$| $$  | $$| $$  | $$| $$ | $$ | $$| $$| $$       /$$__  $$
// | $$$$$$$$|  $$$$$$$|  $$$$$$/| $$  | $$|  $$$$$$/| $$ | $$ | $$| $$|  $$$$$$$|  $$$$$$$
// |________/ \_______/ \______/ |__/  |__/ \______/ |__/ |__/ |__/|__/ \_______/ \_______/
import { Client, codeBlock, EmbedBuilder, resolveColor, WebhookClient } from 'discord.js';
import { DataSource } from 'typeorm';

import {
	ACTIVITY_NAME,
	ACTIVITY_TYPE,
	BOT_TOKEN,
	databaseOptions,
	DB_OPTION,
	DEBUG,
	DEVELOPER_IDS,
	DEVELOPMENT,
	DEVELOPMENT_GUILD_IDS,
	DISCORD_INVITE_URL,
	PORT,
	PUBLIC_GUILD_ID,
	VALIDATE_SETTINGS,
	WEBHOOK_URIS,
} from './config.js';
import { Economica } from './structures/index.js';

const bot = new Economica();

if (!VALIDATE_SETTINGS) {
	bot.log.info('Skipping validation...');
} else {
	// BOT_TOKEN
	bot.log.debug('Validating BOT_TOKEN');
	const token = BOT_TOKEN;
	const testClient = new Client({
		intents: [],
		presence: { activities: [{ name: ACTIVITY_NAME, type: ACTIVITY_TYPE }] },
	});

	await testClient.login(token).catch((err) => {
		testClient.destroy();
		bot.log.fatal(new Error(err));
		process.exit(1);
	});

	// DEVELOPER_IDS
	bot.log.debug('Validating DEVELOPER_IDS');
	DEVELOPER_IDS.forEach(async (id) => {
		await testClient.users.fetch(id).catch((err) => {
			bot.log.fatal(new Error(err));
			process.exit(1);
		});
	});

	// DEVELOPMENT_GUILD_IDS
	bot.log.debug('Validating DEVELOPMENT_GUILD_IDS');
	DEVELOPMENT_GUILD_IDS.forEach(async (id) => {
		const guild = (await testClient.guilds.fetch()).get(id);
		if (!guild) {
			bot.log.fatal(new Error(`The bot is not in a guild with id ${id}`));
			process.exit(1);
		}
	});

	// PUBLIC_GUILD_ID
	bot.log.debug('Validating PUBLIC_GUILD_ID');
	const guild = (await testClient.guilds.fetch()).get(PUBLIC_GUILD_ID);
	if (!guild) {
		bot.log.fatal(new Error(`The bot is not in a guild with id ${PUBLIC_GUILD_ID}`));
	}

	// DISCORD_INVITE_URL
	bot.log.debug('Validating DISCORD_INVITE_URL');
	try {
		const url = new URL(DISCORD_INVITE_URL);
		if (url.toString() !== DISCORD_INVITE_URL) {
			bot.log.fatal(new Error(`Could not validate URL ${url}`));
			process.exit(1);
		}
	} catch (_) {
		bot.log.fatal(new Error(`Invalid URL ${DISCORD_INVITE_URL}`));
		process.exit(1);
	}

	// WEBHOOK_URIS
	bot.log.debug('Validating WEBHOOK_URIS');
	WEBHOOK_URIS.forEach(async (url) => {
		const webhookClient = new WebhookClient({ url });
		if (!webhookClient) {
			bot.log.fatal(new Error(`Could not create Webhook with URL ${url}`));
			process.exit(1);
		}
	});

	testClient.destroy();
	bot.log.info('Settings validated');
}

bot.log.debug('Initializing webhooks');
WEBHOOK_URIS.forEach((WEBHOOK_URI) => {
	bot.webhooks.push(new WebhookClient({ url: WEBHOOK_URI }));
});
bot.log.info('Webhooks initialized');

async function unhandledRejection(err: Error): Promise<void> {
	if (DEBUG) {
		bot.log.fatal(err);
		process.exit(1);
	} else {
		bot.log.error(err);
	}

	const description = codeBlock('js', err.toString());
	const embed = new EmbedBuilder()
		.setColor(resolveColor('Blurple'))
		.setAuthor({ name: 'Unhandled Rejection' })
		.setDescription(description)
		.setTimestamp();
	bot.webhooks.forEach((webhook) => webhook.send({ embeds: [embed] }).catch((e) => bot.log.error(e)));
}

async function uncaughtException(err: Error, origin: string) {
	bot.log.fatal(err);
	const embed = new EmbedBuilder()
		.setColor(resolveColor('Red'))
		.setAuthor({ name: 'CRITICAL | Uncaught Exception' })
		.setDescription(`Caught exception: ${err}\nException origin: ${origin}`)
		.setTimestamp();
	bot.webhooks.forEach((webhook) => webhook.send({ embeds: [embed] }).catch((e) => bot.log.error(e)));
	if (DEVELOPMENT) process.exit(1);
}

bot.log.debug('Connecting to DB');
const entityFiles = await import('./entities');
bot.AppDataSource = await new DataSource({
	...databaseOptions,
	entities: Object.values(entityFiles),
}).initialize();
if (DB_OPTION === 1) {
	await bot.AppDataSource.synchronize();
	bot.log.debug('Database synchronized');
} else if (DB_OPTION === 2) {
	await bot.AppDataSource.synchronize(true);
	bot.log.debug('Database dropped and synchronized');
}

bot.log.info('Connected to DB');

bot.log.debug('Registering events');
const eventFiles = await import('./events');
Object.values(eventFiles).forEach(async (Constructor) => {
	const event = new Constructor();
	bot.log.debug(`Loading event ${event.event}`);
	bot.on(event.event, async (args) => {
		bot.log.debug(`Received event ${event.event}`);
		await event.execute(bot, args as any);
	});
});
bot.log.info('Events loaded');

bot.log.debug('Registering jobs');
const jobFiles = await import('./jobs');
Object.values(jobFiles).forEach(async (Constructor) => {
	const job = new Constructor();
	bot.log.debug(`Loading job ${job.name}`);
	setInterval(async () => {
		bot.log.info(`Executing ${job.name}`);
		await job.execution(bot);
	}, job.cooldown);
});
bot.log.info('Jobs registered');

bot.log.debug('Registering commands');

const files = await import('./commands');
Object.values(files).forEach((Constructor) => {
	const command = new Constructor();

	// Validation
	if (!command.metadata.module) throw new Error(`Command ${command.metadata.name} missing module!`);
	if (!command.metadata.format) throw new Error(`Command ${command.metadata.name} missing format!`);
	if (!command.metadata.examples) throw new Error(`Command ${command.metadata.name} missing examples!`);

	bot.log.debug(`Registering command ${command.metadata.name}`);
	bot.commands.set(command.metadata.name, command);
});

bot.log.info('Commands registered');

bot.log.debug('Registering API...');
import('./api');
bot.log.info(`API listening on port ${PORT}`);

await bot.login(BOT_TOKEN);

bot.log.info(`${bot.user.tag} Initialized`);

process.on('unhandledRejection', (err: Error) => unhandledRejection(err));
process.on('uncaughtException', (err, origin) => uncaughtException(err, origin));

export { bot };
