import { economyDefaults } from '../../config';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { transaction } from '../../lib/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('crime')
		.setDescription('Commit a crime to earn a sum.')
		.setGroup('income')
		.setGlobal(false);

	execute = async (ctx: Context) => {
		const { currency } = ctx.guildDocument;
		const { min, max, chance, minfine, maxfine } = economyDefaults.crime;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);

		if (Math.random() * 100 > chance) {
			await transaction(
				ctx.client,
				ctx.interaction.guildId,
				ctx.interaction.user.id,
				ctx.client.user.id,
				'CRIME_FINE',
				0,
				-fine,
				-fine
			);

			return await ctx.embedify('warn', 'user', `You were caught and fined ${currency}${fine.toLocaleString()}.`);
		}

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.client.user.id,
			'CRIME_FINE',
			amount,
			0,
			amount
		);

		return await ctx.embedify('success', 'user', `You comitted a crime and earned ${currency}${amount.toLocaleString()}.`);
	};
}
