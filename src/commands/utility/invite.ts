import { inviteOptions } from '../../config';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite link for Economica')
		.setModule('UTILITY')
		.setFormat('invite')
		.setExamples(['invite'])
		.setGlobal(true)
		.setEnabled(false);

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		const invite = ctx.client.generateInvite(inviteOptions);
		return ctx
			.embedify(
				'info',
				'bot',
				`**Invite ${ctx.client.user} to your server!**\n[Click Me!](${invite} 'Invite Economica')`,
			)
			.send();
	});
}
