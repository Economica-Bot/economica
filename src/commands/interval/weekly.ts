import { Message } from 'discord.js';

import { interval } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('weekly')
		.setDescription('Earn funds on a weekly basis.')
		.setModule('INTERVAL')
		.setGlobal(false);

	execute = async (ctx: Context): Promise<Message> => {
		return await interval(ctx, 'weekly');
	};
}
