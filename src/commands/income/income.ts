import { economyDefaults } from '../../config';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('income')
		.setDescription('View income commands and their stats.')
		.setGroup('INCOME');

	execute = async (ctx: Context) => {
		const description: string[] = [];
		for (const [k, v] of Object.entries(economyDefaults)) {
			const desc = [];
			for (const [k1, v1] of Object.entries(v)) {
				desc.push(`\`${k1}: ${v1}\``);
			}
			description.push(`**${k}**\n${desc.join('\n')}`);
		}

		return await ctx.embedify('info', 'guild', description.join('\n'));
	};
}
