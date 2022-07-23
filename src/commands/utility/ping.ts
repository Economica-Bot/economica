import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('ping')
		.setDescription("Get Economica's latency")
		.setFormat('ping')
		.setExamples(['ping'])
		.setModule('UTILITY')
		.setGlobal(true);

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		const now = Date.now();
		await ctx.interaction.reply('Pinging...');
		const api = Date.now() - now;
		const ws = ctx.client.ws.ping;
		const content = `\`\`\`ansi\n[1;34mGateway Ping [0m: [0;35m${ws}[0mms\n[1;34mRest Ping    [0m: [0;35m${api}[0mms\n\`\`\``;
		await ctx.interaction.editReply({ embeds: [ctx.embedify('success', 'bot', content)] });
	});
}
