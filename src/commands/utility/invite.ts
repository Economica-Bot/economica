import { inviteOptions } from '../../config';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite link for Economica')
		.setModule('UTILITY')
		.setFormat('invite')
		.setExamples(['invite'])
		.setGlobal(true)
		.setEnabled(false);

	public execution = new Router()
		.get('', (ctx) => new ExecutionNode()
			.setName('Invite Economica')
			.setDescription(`**Invite ${ctx.interaction.client.user} to your server!**\n[Click Me!](${ctx.interaction.client.generateInvite(inviteOptions)} 'Invite Economica')`));
}
