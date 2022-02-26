import { InfractionModel, Member } from '../models/index.js';
import { Economica, Service } from '../structures/index.js';
import { SERVICE_COOLDOWNS } from '../typings/constants.js';

export default class implements Service {
	public service = 'update-bans';
	public cooldown = SERVICE_COOLDOWNS.UPDATE_BANS;
	public execute = async (client: Economica) => {
		const now = new Date();
		const bans = await InfractionModel.find({ type: 'BAN', active: true, permanent: false });
		bans.forEach(async (ban) => {
			if (ban.createdAt.getTime() + ban.duration < now.getTime()) {
				await ban.updateOne({ active: false });
				const memberDocument = ban.parent() as Member;
				const { guild: guildDocument } = await memberDocument.populate('guild');
				const guild = client.guilds.cache.get(guildDocument.guildId);
				await guild.members.unban(memberDocument.userId, 'Economica: Ban expired.');
			}
		});
	};
}
