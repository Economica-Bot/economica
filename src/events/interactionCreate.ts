import { CommandInteraction, PermissionResolvable } from 'discord.js';
import {
	EconomicaClient,
	EconomicaCommand,
	PermissionRole,
	EconomicaSlashCommandBuilder,
} from '../structures/index';
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
