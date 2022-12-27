import {
	Client,
	codeBlock,
	Colors,
	EmbedBuilder,
	Events,
	InteractionType
} from 'discord.js';
import ms from 'ms';
import * as Commands from './commands';
import * as Jobs from './jobs';
import { env } from './env.mjs';
import { resetCommands, updateCommands } from './lib/commands.js';
import { Command, datasource, Guild, Member, User } from '@economica/db';

export const client = new Client({
	intents: ['Guilds', 'GuildMessages']
});
await client.login(env.DISCORD_BOT_TOKEN);

console.info('Registering commands');
if (env.DEPLOY_COMMANDS === 'nothing') {
	console.debug('Commands Idle');
} else if (env.DEPLOY_COMMANDS === 'update') {
	await updateCommands(client);
} else if (env.DEPLOY_COMMANDS === 'reset') {
	await resetCommands(client);
	await updateCommands(client);
}

console.info('Registering Jobs');
Object.entries(Jobs).forEach(([k, v]) => {
	console.debug(`Registered ${k}`);
	v.start();
});

client.on(Events.InteractionCreate, async (interaction) => {
	console.info(
		`${InteractionType[interaction.type]} Interaction Received | Guild: ${
			interaction.guildId
		}, User: ${interaction.user.id}`
	);

	if (!interaction.inCachedGuild()) return;

	await datasource
		.getRepository(User)
		.upsert({ id: interaction.user.id }, { conflictPaths: ['id'] });
	await datasource
		.getRepository(User)
		.upsert({ id: interaction.client.user.id }, { conflictPaths: ['id'] });
	await datasource
		.getRepository(Guild)
		.upsert({ id: interaction.guildId }, { conflictPaths: ['id'] });
	await datasource
		.getRepository(Member)
		.upsert(
			{ userId: interaction.user.id, guildId: interaction.guildId },
			{ conflictPaths: ['userId', 'guildId'] }
		);
	await datasource
		.getRepository(Member)
		.upsert(
			{ userId: interaction.client.user.id, guildId: interaction.guildId },
			{ conflictPaths: ['userId', 'guildId'] }
		);

	const guildEntity = await datasource
		.getRepository(Guild)
		.findOneByOrFail({ id: interaction.guildId });

	try {
		const command = Object.values(Commands).find((c) => {
			if (interaction.isChatInputCommand()) {
				return c.identifier.test(interaction.commandName);
			} else if (interaction.isButton()) {
				if (interaction.customId.split(':')[1] !== interaction.user.id)
					throw new Error('You did not invoke this command');
				return c.identifier.test(interaction.customId);
			} else if (interaction.isModalSubmit()) {
				return c.identifier.test(interaction.customId);
			} else if (interaction.isSelectMenu()) {
				if (interaction.customId.split(':')[1] !== interaction.user.id)
					throw new Error('You did not invoke this command');
				return c.identifier.test(interaction.values[0]);
			} else return false;
		});

		if (!command) throw new Error('Unknown interaction');

		if (interaction.isChatInputCommand()) {
			const { intervals, incomes } = guildEntity;
			if (interaction.commandName in { ...incomes, ...intervals }) {
				const commandName = interaction.commandName as
					| keyof typeof incomes
					| keyof typeof intervals;
				const { cooldown } = { ...incomes, ...intervals }[commandName];
				const command = await datasource.getRepository(Command).findOne({
					order: {
						createdAt: 'DESC'
					},
					where: {
						member: {
							userId: interaction.user.id,
							guildId: interaction.guildId
						},
						command: commandName
					}
				});
				if (command && command.createdAt.getTime() + cooldown > Date.now()) {
					throw new Error(
						`You may run this command in ${ms(
							command.createdAt.getTime() + cooldown - Date.now(),
							{ long: true }
						)}\nCooldown: ${ms(cooldown)}`
					);
				}
			}

			await command.execute(interaction as never, {} as never);
			const execution = datasource.getRepository(Command).create({
				member: { userId: interaction.user.id, guildId: interaction.guildId },
				command: interaction.commandName
			});
			await datasource.getRepository(Command).save(execution);
		} else {
			const args =
				interaction.isButton() || interaction.isModalSubmit()
					? command.identifier.exec(interaction.customId)
					: interaction.isAnySelectMenu()
					? command.identifier.exec(interaction.values[0])
					: undefined;

			await command.execute(interaction as never, args as never);
		}
	} catch (err) {
		const message =
			err instanceof Error ? codeBlock(err.toString()) : 'Unknown Error :(';
		const embed = new EmbedBuilder()
			.setColor(Colors.DarkRed)
			.setTitle('Oops!')
			.setTimestamp()
			.setDescription(message);
		if (!interaction.isRepliable()) throw err;
		if (interaction.replied) {
			await interaction.followUp({ embeds: [embed], ephemeral: true });
		} else {
			await interaction.reply({ embeds: [embed], ephemeral: true });
		}

		throw err;
	}
});

process.on('unhandledRejection', (err: Error) => console.error(err));
process.on('uncaughtException', (err) => console.error(err));
