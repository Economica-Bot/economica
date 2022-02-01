import { SERVICE_COOLDOWNS } from '../config';
import { InfractionModel } from '../models';
import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	name = 'update-bans';
	cooldown = SERVICE_COOLDOWNS.UPDATE_BANS;
	execute = async (client: EconomicaClient) => {
		const now = new Date();
		const bans = await InfractionModel.find({ type: 'BAN', active: true, permanent: false });
		bans.forEach(async (ban) => {
			if (ban.createdAt.getTime() + ban.duration < now.getTime()) {
				await ban.updateOne({ active: false });
				const guild = client.guilds.cache.get(ban.guildId);
				await guild.members.unban(ban.userId, 'Economica: Ban expired.');
			}
		});
	};
}
