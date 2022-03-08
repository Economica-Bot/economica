import ms from 'ms';
import { Context, EconomicaSlashCommandBuilder } from '../../structures';
import { Command } from '../../structures/Command';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('statistics')
		.setDescription('View server and bot statistics')
		.setModule('INSIGHTS');

	public execute = async (ctx: Context) => {
		const embed = ctx.embedify('info', 'bot', `
		${ctx.client.user} **Statistics**
		*Websocket Ping*: \`${ctx.client.ws.ping}\`
		*Bot Uptime*: \`${ms(ctx.client.uptime)}\`
		*Runtime Uptime*: \`${ms(process.uptime() / 1000)}\`
		*Memory Usage*: \`${process.memoryUsage}\`
		
		`);

		await ctx.interaction.reply({ embeds: [embed] });
	};
}
