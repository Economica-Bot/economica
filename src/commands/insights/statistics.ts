import { Util } from 'discord.js';
import ms from 'ms';

import { Command as CommandEntity } from '../../entities/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';
import { Emojis } from '../../typings/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('statistics')
		.setDescription('View server and bot statistics')
		.setModule('INSIGHTS')
		.setFormat('statistics')
		.setExamples(['statistics']);

	public execute = async (ctx: Context) => {
		const description = `**Welcome to ${ctx.client.user}'s Statistics Dashboard!**`;
		const botStats = `Websocket Ping: \`${ctx.client.ws.ping}ms\`\n`
			+ `Bot Uptime: \`${ms(ctx.client.uptime)}\`\n`
			+ `Commands Ran: \`${(await CommandEntity.find({ relations: ['member', 'member.guild'], where: { member: { guildId: ctx.guildEntity.id } } })).length}\``;
		const memberStats = `Roles: \`${ctx.interaction.member.roles.cache.size}\`\n`
			+ `Commands Used: \`${(await CommandEntity.find({ where: { member: { userId: ctx.memberEntity.userId, guildId: ctx.guildEntity.id } } })).length}\`\n`
			+ `Joined: <t:${Math.round(ctx.interaction.member.joinedAt.getTime() / 1000)}:f>`;
		const serverStats = `Roles: \`${ctx.interaction.guild.roles.cache.size}\`\n`
			+ `Members: \`${ctx.interaction.guild.members.cache.size}\`\n`
			+ `Channels: \`${ctx.interaction.guild.channels.cache.size}\``;
		const embed = ctx
			.embedify('info', 'user', description)
			.setAuthor({ name: 'Statistics Dashboard', iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.TREND).id)?.url })
			.addFields([
				{ name: `${Emojis.CPU} \`Bot Statistics\``, value: botStats, inline: true },
				{ name: `${Emojis.PERSON_ADD} \`Member Statistics\``, value: memberStats, inline: true },
				{ name: `${Emojis.NETWORK} \`Server Statistics\``, value: serverStats, inline: true },
			]);
		await ctx.interaction.reply({ embeds: [embed] });
	};
}
