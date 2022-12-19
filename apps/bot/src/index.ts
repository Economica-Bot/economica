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
import { trpc } from './lib/trpc.js';

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

	await trpc.user.create.mutate({ id: interaction.user.id });
	await trpc.user.create.mutate({ id: interaction.client.user.id });
	await trpc.guild.create.mutate({
		id: interaction.guildId
	});
	await trpc.member.create.mutate({
		userId: interaction.user.id,
		guildId: interaction.guildId
	});
	await trpc.member.create.mutate({
		userId: interaction.client.user.id,
		guildId: interaction.guildId
	});

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
			} else if (interaction.isAnySelectMenu()) {
				if (interaction.customId.split(':')[1] !== interaction.user.id)
					throw new Error('You did not invoke this command');
				return c.identifier.test(interaction.values[0]);
			} else return false;
		});

		if (!command) throw new Error('Unknown interaction');

		if (interaction.isChatInputCommand()) {
			const guildEntity = await trpc.guild.byId.query({
				id: interaction.guildId
			});
			const { intervals, incomes } = guildEntity;
			if (interaction.commandName in { ...incomes, ...intervals }) {
				const commandName = interaction.commandName as
					| keyof typeof incomes
					| keyof typeof intervals;
				const { cooldown } = { ...incomes, ...intervals }[commandName];
				const command = await trpc.execution.findMostRecent.query({
					member: { userId: interaction.user.id, guildId: interaction.guildId },
					command: commandName
				});
				if (
					command &&
					new Date(command.createdAt).getTime() + cooldown > Date.now()
				) {
					throw new Error(
						`You may run this command in ${ms(
							new Date(command.createdAt).getTime() + cooldown - Date.now(),
							{ long: true }
						)}\nCooldown: ${ms(cooldown)}`
					);
				}
			}

			await trpc.execution.create.mutate({
				member: { userId: interaction.user.id, guildId: interaction.guildId },
				command: interaction.commandName
			});
		}

		const args = interaction.isChatInputCommand()
			? command.identifier.exec(interaction.commandName)
			: interaction.isButton() || interaction.isModalSubmit()
			? command.identifier.exec(interaction.customId)
			: interaction.isSelectMenu()
			? command.identifier.exec(interaction.values[0])
			: undefined;

		await command.execute(interaction as any, args as any);
	} catch (err) {
		const message =
			err instanceof Error ? codeBlock(err.toString()) : 'Unknown Error :(';
		const embed = new EmbedBuilder()
			.setColor(Colors.DarkRed)
			.setTitle('Oops!')
			.setTimestamp()
			.setDescription(message);
		if (interaction.isRepliable())
			await interaction.reply({ embeds: [embed], ephemeral: true });
		throw err;
	}
});

process.on('unhandledRejection', (err: Error) => console.error(err.toString()));
process.on('uncaughtException', (err) => console.error(err.toString()));
