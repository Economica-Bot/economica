import { GuildMember } from 'discord.js';
import { EconomicaClient } from '../structures/index';
import { InfractionModel } from '../models/index';

export const name = 'guildMemberAdd';

export async function execute(client: EconomicaClient, member: GuildMember) {
	const { guild, id } = member;
	const currentMute = await InfractionModel.findOne({
		guildId: guild.id,
		userId: id,
		type: 'mute',
		active: true,
	});

	if (currentMute) {
		const role = guild.roles.cache.find((role) => {
			return role.name.toLowerCase() === 'muted';
		});

		if (role) {
			member.roles.add(role);
		}
	}
}
