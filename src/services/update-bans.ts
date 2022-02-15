import { SERVICE_COOLDOWNS } from '../config';
import { Guild, InfractionModel, Member } from '../models';
import { EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	public name = 'update-bans';
	public cooldown = SERVICE_COOLDOWNS.UPDATE_BANS;
	public execute = async (client: EconomicaClient) => {
		const now = new Date();
		const bans = await InfractionModel.find({ type: 'BAN', active: true, permanent: false });
		bans.forEach(async (ban) => {
			if (ban.createdAt.getTime() + ban.duration < now.getTime()) {
				await ban.updateOne({ active: false });
				const memberDocument = ban.populate('target').parent() as Member;
				const guildDocument = memberDocument.populate('guild').guild as Guild;
				const guild = client.guilds.cache.get(guildDocument.guildId);
				await guild.members.unban(memberDocument.userId, 'Economica: Ban expired.');
			}
		});
	};
}
