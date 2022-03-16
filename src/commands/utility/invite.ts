import { inviteOptions } from '../../config.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite link for Economica')
		.setModule('UTILITY')
		.setFormat('invite')
		.setExamples(['invite'])
		.setGlobal(true)
		.setEnabled(false);

	public execute = async (ctx: Context): Promise<void> => {
		const invite = ctx.client.generateInvite(inviteOptions);
		return ctx.embedify('info', 'bot', `**Invite ${ctx.client.user} to your server!**\n[Click Me!](${invite} 'Invite Economica')`).send();
	};
}
