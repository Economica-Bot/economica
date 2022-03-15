import { Util } from 'discord.js';
import ms from 'ms';

import { Command as CommandEntity } from '../../entities';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('statistics')
		.setDescription('View server and bot statistics')
		.setModule('INSIGHTS')
		.setFormat('statistics')
		.setExamples(['statistics']);

	public execute = async (ctx: Context) => {
		const description = `**Welcome to ${ctx.client.user}'s Statistics Dashboard!**`;
		const botStats = `*Websocket Ping*: \`${ctx.client.ws.ping}ms\`\n`
			+ `*Bot Uptime*: \`${ms(ctx.client.uptime)}\`\n`
			+ `*Commands Ran*: \`${(await CommandEntity.find({ relations: ['member', 'member.guild'], where: { member: { guild: ctx.guildEntity } } })).length}\``;
		const memberStats = `*Roles*: \`${ctx.interaction.member.roles.cache.size}\`\n`
			+ `*Commands Used*: \`${(await CommandEntity.find({ member: ctx.memberEntity })).length}\`\n`
			+ `*Joined Server*: \`${ctx.interaction.member.joinedAt.toLocaleString()}\``;
		const serverStats = `*Roles*: \`${ctx.interaction.guild.roles.cache.size}\`\n`
			+ `*Members*: \`${ctx.interaction.guild.memberCount}\`\n`
			+ `*Channels*: \`${ctx.interaction.guild.channels.cache.size}\``;
		const embed = ctx
			.embedify('info', 'user', description)
			.setAuthor({ name: 'Statistics Dashboard', iconURL: ctx.client.emojis.resolve(Util.parseEmoji(Emojis.ANALYTICS).id).url })
			.addFields([
				{ name: `${Emojis.ROBOT} Bot Statistics`, value: botStats, inline: true },
				{ name: `${Emojis.TEAM_MEMBER} Member Statistics`, value: memberStats, inline: true },
				{ name: `${Emojis.COMMUNITY} Server Statistics`, value: serverStats, inline: true },
			]);
		await ctx.interaction.reply({ embeds: [embed] });
	};
}
