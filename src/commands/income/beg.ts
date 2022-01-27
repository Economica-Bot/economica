import { economyDefaults } from '../../config';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('beg')
		.setDescription('Beg to earn a sum.')
		.setGroup('income')
		.setGlobal(false);

	execute = async (ctx: Context) => {
		const { currency } = ctx.guildDocument;
		const { min, max, chance } = economyDefaults.beg;
		const amount = Math.ceil(Math.random() * (max - min) + min);

		if (Math.random() * 100 > chance) return await ctx.embedify('warn', 'user', 'You begged and earned nothing :cry:');

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.client.user.id,
			'BEG',
			amount,
			0,
			amount
		);

		return await ctx.embedify('success', 'user', `You begged and earned ${currency}${amount.toLocaleString()}`);
	};
}
