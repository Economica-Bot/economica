import { GuildMember } from 'discord.js';
import {InfractionModel} from '../models/infractions';
import EconomicaClient from '../structures/EconomicaClient';

export const name = 'guildMemberAdd';

export async function execute(client: EconomicaClient, member: GuildMember) {
	const { guild, id } = member;
	const currentMute = await InfractionModel.findOne({
		guildID: guild.id,
		userID: id,
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
