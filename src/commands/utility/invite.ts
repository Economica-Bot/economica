import { inviteOptions } from '../../config';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite link for Economica')
		.setModule('UTILITY')
		.setFormat('invite')
		.setExamples(['invite'])
		.setGlobal(true)
		.setEnabled(false);

	public execution = new ExecutionNode()
		.setName('Invite Economica')
		.setValue('invite')
		.setDescription((ctx) => {
			const invite = ctx.interaction.client.generateInvite(inviteOptions);
			return `**Invite ${ctx.interaction.client.user} to your server!**\n[Click Me!](${invite} 'Invite Economica')`;
		});
}
