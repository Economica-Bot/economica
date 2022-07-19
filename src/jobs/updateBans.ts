import { Infraction } from '../entities';
import { Economica, Job } from '../structures';

export class BansJob implements Job {
	public name = 'update-bans';
	public cooldown = 1000 * 60;
	public execute = async (client: Economica) => {
		const now = new Date();
		const bans = await Infraction.find({ relations: ['guild', 'target', 'target.user'], where: { type: 'BAN', active: true, permanent: false } });
		bans.forEach(async (ban) => {
			if (ban.createdAt.getTime() + ban.duration < now.getTime()) {
				const guild = client.guilds.cache.get(ban.guild.id);
				await guild.members.unban(ban.target.userId, 'Economica | Ban expired.');
			}
		});

		await Infraction.update({ type: 'BAN', active: true, permanent: false }, { active: false, permanent: true });
	};
}
