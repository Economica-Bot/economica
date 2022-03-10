import { Infraction } from '../entities/index.js';
import { Economica, Job } from '../structures/index.js';

export default class implements Job {
	public name = 'update-bans';
	public cooldown = 1000 * 60;
	public execute = async (client: Economica) => {
		const now = new Date();
		const bans = await Infraction.find({ relations: ['guild', 'target', 'target.user'], where: { type: 'BAN', active: true, permanent: false } });
		bans.forEach(async (ban) => {
			if (ban.createdAt.getTime() + ban.duration < now.getTime()) {
				ban.active = false;
				await ban.save();
				const guild = client.guilds.cache.get(ban.guild.id);
				await guild.members.unban(ban.target.user.id, 'Economica | Ban expired.');
			}
		});
	};
}
