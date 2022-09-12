import { Infraction } from '../entities';
import { Economica, Job } from '../structures';

export class BansJob implements Job {
	public name = 'update-bans';

	public cooldown = 1000 * 60;

	public execution = async (client: Economica) => {
		const bans = await Infraction.find({
			relations: ['guild', 'target', 'target.user'],
			where: { type: 'BAN', active: true, permanent: false },
		});
		bans
			.filter((ban) => ban.createdAt.getTime() + ban.duration < Date.now())
			.forEach(async (ban) => {
				const guild = client.guilds.cache.get(ban.guild.id);
				await guild.members.unban(ban.target.userId, 'Economica | Ban expired.').catch(() => null);
				await ban.save();
			});
	};
}
