import { inviteOptions } from '../../config';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite link for Economica.')
		.setGroup('utility')
		.setGlobal(true)
		.setEnabled(false);

	execute = async (ctx: Context) => {
		const invite = await ctx.client.generateInvite(inviteOptions);
		return await ctx.embedify('info', 'bot', `Invite link: __[Click Here](${invite} 'Invite Economica')__`);
	};
}
