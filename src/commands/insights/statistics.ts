import ms from 'ms';

import { Command as CommandEntity } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('statistics')
		.setDescription('View server and bot statistics')
		.setModule('INSIGHTS')
		.setFormat('statistics')
		.setExamples(['statistics']);

	public execution = new Router()
		.get('', async (ctx) => {
			const description = `**Welcome to ${ctx.interaction.client.user}'s Statistics Dashboard!**`;
			const botStats = `>>> Websocket Ping: \`${ctx.interaction.client.ws.ping}ms\`\n`
				+ `Bot Uptime: \`${ms(ctx.interaction.client.uptime)}\`\n`
				+ `Commands Ran: \`${(await CommandEntity.findBy({ member: { guildId: ctx.memberEntity.guildId } })).length}\``;
			const memberStats = `Roles: \`${ctx.interaction.member.roles.cache.size}\`\n`
				+ `>>> Commands Used: \`${(await CommandEntity.findBy({ member: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId } }))
					.length
				}\`\n`
				+ `Joined: <t:${Math.round(ctx.interaction.member.joinedAt.getTime() / 1000)}:f>`;
			const serverStats = `>>> Roles: \`${ctx.interaction.guild.roles.cache.size}\`\n`
				+ `Members: \`${ctx.interaction.guild.members.cache.size}\`\n`
				+ `Bots: \`${ctx.interaction.guild.members.cache.filter((member) => member.user.bot).size}\`\n`
				+ `Channels: \`${ctx.interaction.guild.channels.cache.size}\``;
			return new ExecutionNode()
				.setName('Statistics Dashboard')
				.setDescription(description)
				.setOptions(
					['displayInline', `${Emojis.CPU} \`Bot Statistics\``, botStats],
					['displayInline', `${Emojis.PERSON_ADD} \`Member Statistics\``, memberStats],
					['displayInline', `${Emojis.NETWORK} \`Server Statistics\``, serverStats],
				);
		});
}
