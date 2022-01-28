import { economyDefaults } from '../../config';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { getEconInfo, transaction } from '../../lib/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('rob')
		.setDescription('Rob a user to earn a sum.')
		.setGroup('INCOME')
		.setFormat('<user>')
		.setExamples(['rob @Wumpus'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user.').setRequired(true));

	execute = async (ctx: Context) => {
		const target = ctx.interaction.options.getUser('user');
		const { wallet: targetWallet } = await getEconInfo(ctx.interaction.guildId, target.id);
		const amount = Math.ceil(Math.random() * targetWallet);
		const { currency } = ctx.guildDocument;
		const { chance, minfine, maxfine } = economyDefaults.rob;
		const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);

		if (target.id === ctx.client.user.id) return await ctx.embedify('warn', 'user', `You cannot rob me!`);
		if (ctx.interaction.user.id === target.id) return await ctx.embedify('warn', 'user', 'You cannot rob yourself');
		if (targetWallet <= 0) return await ctx.embedify('warn', 'user', `<@!${target.id}> has no money to rob!`);

		if (Math.random() * 100 > chance) {
			await transaction(
				ctx.client,
				ctx.interaction.guildId,
				ctx.interaction.user.id,
				ctx.client.user.id,
				'ROB_FINE',
				0,
				-fine,
				-fine
			);

			return await ctx.embedify('warn', 'user', `You were caught and fined ${currency}${fine.toLocaleString()}`);
		}

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			target.id,
			'ROB_SUCCESS',
			amount,
			0,
			amount
		);

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			target.id,
			ctx.interaction.user.id,
			'ROB_VICTIM',
			-amount,
			0,
			-amount
		);

		return await ctx.embedify('success', 'user', `You stole ${currency}${amount.toLocaleString()} from ${target}.`);
	};
}
