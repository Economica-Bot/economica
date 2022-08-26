import { codeBlock } from 'discord.js';

import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('ping')
		.setDescription("Get Economica's latency")
		.setFormat('ping')
		.setExamples(['ping'])
		.setModule('UTILITY')
		.setGlobal(true);

	public execution = new Router()
		.get('', async (ctx) => {
			const now = Date.now();
			await ctx.interaction.reply('Pinging...');
			const ping = Date.now() - now;
			return new ExecutionNode()
				.setName('Ping Pong!')
				.setDescription(
					codeBlock(
						'ansi',
						`[1;34mGateway Ping [0m: [0;35m${ctx.interaction.client.ws.ping}[0mms\n[1;34mRest Ping    [0m: [0;35m${ping}[0mms\n`,
					),
				);
		});
}
