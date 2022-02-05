import { Message } from 'discord.js';

import { getEconInfo, transaction } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('rob')
		.setDescription('Rob a user to earn a sum.')
		.setModule('INCOME')
		.setFormat('<user>')
		.setExamples(['rob @Wumpus'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user.').setRequired(true));

	public execute = async (ctx: Context): Promise<Message> => {
		const target = ctx.interaction.options.getUser('user');
		const { wallet: targetWallet } = await getEconInfo(ctx.interaction.guildId, target.id);
		const amount = Math.ceil(Math.random() * targetWallet);
		const { currency } = ctx.guildDocument;
		const { chance, minfine, maxfine } = ctx.guildDocument.income.rob;
		const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);

		if (target.id === ctx.client.user.id) return await ctx.embedify('warn', 'user', `You cannot rob me!`, true);
		if (ctx.interaction.user.id === target.id)
			return await ctx.embedify('warn', 'user', 'You cannot rob yourself', true);
		if (targetWallet <= 0) return await ctx.embedify('warn', 'user', `<@!${target.id}> has no money to rob!`, true);

		if (Math.random() * 100 > chance) {
			transaction(
				ctx.client,
				ctx.interaction.guildId,
				ctx.interaction.user.id,
				ctx.client.user.id,
				'ROB_FINE',
				0,
				-fine,
				-fine
			);

			return await ctx.embedify('warn', 'user', `You were caught and fined ${currency}${fine.toLocaleString()}`, false);
		}

		transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			target.id,
			'ROB_SUCCESS',
			amount,
			0,
			amount
		);

		transaction(
			ctx.client,
			ctx.interaction.guildId,
			target.id,
			ctx.interaction.user.id,
			'ROB_VICTIM',
			-amount,
			0,
			-amount
		);

		return await ctx.embedify(
			'success',
			'user',
			`You stole ${currency}${amount.toLocaleString()} from ${target}.`,
			false
		);
	};
}
