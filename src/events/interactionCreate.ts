import { SlashCommandSubcommandGroupBuilder } from '@discordjs/builders';
import { CommandInteraction, PermissionResolvable } from 'discord.js';
import EconomicaClient from '../structures/EconomicaClient';
import EconomicaCommand from '../structures/EconomicaCommand';
import { EconomicaSlashCommandBuilder } from '../structures/EconomicaSlashCommandBuilder';
import { EconomicaSlashCommandSubcommandBuilder } from '../structures/EconomicaSlashCommandSubcommands';

export const name = 'interactionCreate';

export async function execute(client: EconomicaClient, interaction: CommandInteraction) {
	if (!interaction.isCommand()) {
		return;
	}

	const command = client.commands.get(interaction.commandName) as EconomicaCommand;
	const data = command.data as EconomicaSlashCommandBuilder;

	await command?.execute(client, interaction);
}

async function permissionCheck(interaction: CommandInteraction, data: EconomicaSlashCommandBuilder) {
	const member = interaction.member;
	const channel = interaction.channel;
	const permissions = interaction.options;
}
