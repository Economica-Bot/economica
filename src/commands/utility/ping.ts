import { codeBlock } from 'discord.js';

import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('ping')
		.setDescription("Get Economica's latency")
		.setFormat('ping')
		.setExamples(['ping'])
		.setModule('UTILITY')
		.setGlobal(true);

	public execution = new ExecutionNode()
		.setName('Ping Pong!')
		.setValue('ping')
		.setDescription((ctx) => codeBlock(`ansi\n[1;34mGateway Ping [0m: [0;35m${ctx.variables.ws}[0mms\n[1;34mRest Ping    [0m: [0;35m${ctx.variables.api}[0mms\n`))
		.setExecution(async (ctx) => {
			ctx.variables.api = Date.now() - ctx.interaction.createdTimestamp;
			ctx.variables.ws = ctx.interaction.client.ws.ping;
		});
}
