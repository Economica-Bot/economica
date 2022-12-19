import cron from 'node-cron';
import { client } from '..';
import { trpc } from '../lib/trpc';

export const BansJob = cron.schedule('* * * * *', async () => {
	console.info('updating active bans');
	const bans = await trpc.infraction.getActiveBans.query();
	bans
		.filter(
			(ban) =>
				ban.duration && ban.createdAt.getTime() + ban.duration < Date.now()
		)
		.forEach(async (ban) => {
			const guild = await client.guilds.fetch(ban.guild.id);
			await guild.members
				.unban(ban.target.userId, 'Ban expired')
				.catch(() => null);
		});
});
