import { Client } from 'discord.js';

import { InfractionModel } from '../models/infractions';

export const name = 'mute';

export async function execute(client: Client) {
	setInterval(async () => {
		const now = new Date();
		const conditional = {
			type: 'mute',
			permanent: false,
			active: true,
			expires: {
				$lt: now,
			},
		};

		const results = await InfractionModel.find(conditional);

		//Unmute currently muted users whose mute has expired
		if (results && results.length) {
			for (const result of results) {
				const { guildID, userID } = result;
				const guild = client.guilds.cache.get(`${guildID}`);
				const member = (await guild.members.fetch()).get(`${userID}`);
				const mutedRole = guild.roles.cache.find((role) => {
					return role.name.toLowerCase() === 'muted';
				});

				const clientMember = await guild.members.cache.get(client.user.id);

				if (clientMember.roles.highest.position > mutedRole.position) {
					member.roles.remove(mutedRole);
				}
			}

			await InfractionModel.updateMany(conditional, {
				active: false,
			});
		}
	}, 1000 * 5);
}
