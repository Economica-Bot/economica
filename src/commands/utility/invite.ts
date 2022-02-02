import { Message } from 'discord.js';

import { inviteOptions } from '../../config';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the invite link for Economica.')
		.setGroup('UTILITY')
		.setGlobal(true)
		.setEnabled(false);

	public execute = async (ctx: Context): Promise<Message> => {
		const invite = await ctx.client.generateInvite(inviteOptions);
		return await ctx.embedify('info', 'bot', `Invite link: __[Click Here](${invite} 'Invite Economica')__`, false);
	};
}
