import { parseEmoji } from 'discord.js';
import ms from 'ms';

import { Command as CommandEntity } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('statistics')
		.setDescription('View server and bot statistics')
		.setModule('INSIGHTS')
		.setFormat('statistics')
		.setExamples(['statistics']);

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		const description = `**Welcome to ${ctx.client.user}'s Statistics Dashboard!**`;
		const botStats = `Websocket Ping: \`${ctx.client.ws.ping}ms\`\n`
			+ `Bot Uptime: \`${ms(ctx.client.uptime)}\`\n`
			+ `Commands Ran: \`${(await CommandEntity.findBy({ member: { guildId: ctx.memberEntity.guildId } })).length}\``;
		const memberStats = `Roles: \`${ctx.interaction.member.roles.cache.size}\`\n`
			+ `Commands Used: \`${(await CommandEntity.findBy({ member: { userId: ctx.memberEntity.userId, guildId: ctx.memberEntity.guildId } })).length}\`\n`
			+ `Joined: <t:${Math.round(ctx.interaction.member.joinedAt.getTime() / 1000)}:f>`;
		const serverStats = `Roles: \`${ctx.interaction.guild.roles.cache.size}\`\n`
			+ `Members: \`${ctx.interaction.guild.members.cache.size}\`\n`
			+ `Bots: \`${ctx.interaction.guild.members.cache.filter((member) => member.user.bot).size}\`\n`
			+ `Channels: \`${ctx.interaction.guild.channels.cache.size}\``;
		await ctx
			.embedify('info', 'user', description)
			.setAuthor({ name: 'Statistics Dashboard', iconURL: ctx.client.emojis.resolve(parseEmoji(Emojis.TREND).id)?.url })
			.addFields([
				{ name: `${Emojis.CPU} \`Bot Statistics\``, value: botStats, inline: true },
				{ name: `${Emojis.PERSON_ADD} \`Member Statistics\``, value: memberStats, inline: true },
				{ name: `${Emojis.NETWORK} \`Server Statistics\``, value: serverStats, inline: true },
			])
			.send();
	});
}
