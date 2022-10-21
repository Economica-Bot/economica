import { Routes } from 'discord-api-types/v10';
import { Infraction } from '../entities';
import { Economica } from '../structures';
import { Job } from '../typings';

export class BansJob implements Job {
	public name = 'update-bans';

	public cooldown = 1000 * 60;

	public execution = async (client: Economica) => {
		const bans = await Infraction.find({
			relations: ['guild', 'target', 'target.user'],
			where: { type: 'BAN', active: true, permanent: false }
		});
		bans
			.filter((ban) => ban.createdAt.getTime() + ban.duration! < Date.now())
			.forEach(async (ban) => {
				await client.rest.delete(Routes.guildBans(ban.guild.id), {
					body: { reason: 'Economica | Ban expired.' }
				});
				await ban.save();
			});
	};
}
