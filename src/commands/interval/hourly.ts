import { Message } from 'discord.js';

import { interval } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('hourly')
		.setDescription('Earn funds on an hourly basis.')
		.setModule('INTERVAL')
		.setGlobal(false);

	execute = async (ctx: Context): Promise<Message> => {
		return await interval(ctx, 'hourly');
	};
}
