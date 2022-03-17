import { ApplicationCommandPermissionData, ApplicationCommandPermissionType, Guild } from 'discord.js';

import { Economica, Event } from '../structures/index.js';

export default class implements Event {
	public event = 'guildCreate' as const;
	public async execute(client: Economica, guild: Guild): Promise<void> {
		await client.application.commands.fetch();
		await guild.members.fetch();
		const admins = guild.members.cache.filter((member) => member.permissions.has('Administrator'));
		const fullPermissions = client.application.commands.cache.map((command) => ({
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
}
