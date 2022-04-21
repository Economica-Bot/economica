import { ApplicationCommandPermissionData, ApplicationCommandPermissionType, Guild } from 'discord.js';
import { Economica } from '../structures';

export async function syncPermissions(client: Economica, guild: Guild) {
	const clientCommands = await client.application.commands.fetch();
	const guildCommands = await guild.commands.fetch();
	const commands = clientCommands.concat(guildCommands);
	const members = await guild.members.fetch();
	const admins = members.filter((member) => member.permissions.has('Administrator'));
	const fullPermissions = commands.map((command) => ({
		id: command.id,
		permissions: admins.map((member) => ({
			id: member.id,
			type: ApplicationCommandPermissionType.User,
			permission: true } as ApplicationCommandPermissionData)),
	}));
	await client.application.commands.permissions.set({
		guild: guild.id,
		fullPermissions,
	});
}
