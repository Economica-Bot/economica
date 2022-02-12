import { parseString } from '@adrastopoulos/number-parser';
import { GuildMember, Message } from 'discord.js';

import { getEconInfo, transaction } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('set-money')
		.setDescription('Set a balance.')
		.setModule('ECONOMY')
		.setFormat('<user> <amount> <target>')
		.setExamples(['set-money @JohnDoe 300 wallet', 'set-money @Wumpus 100 treasury'])
		.setAuthority('MANAGER')
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true))
		.addStringOption((option) =>
			option
				.setName('target')
				.setDescription('Specify where the money is added.')
				.addChoices([
					['wallet', 'wallet'],
					['treasury', 'treasury'],
				])
				.setRequired(true)
		);

	public execute = async (ctx: Context): Promise<Message> => {
		const { currency } = ctx.guildDocument;
		const member = ctx.interaction.options.getMember('user') as GuildMember;
		const amount = parseString(ctx.interaction.options.getString('amount'));
		const target = ctx.interaction.options.getString('target');
		const { wallet, treasury } = await getEconInfo(ctx.interaction.guildId, ctx.interaction.user.id);
		const difference = target === 'wallet' ? amount - wallet : amount - treasury;

		if (!amount) {
			return await ctx.embedify('error', 'user', 'Please enter a valid amount.', true);
		}

		transaction(
			ctx.client,
			ctx.interaction.guild.id,
			member.id,
			ctx.interaction.user.id,
			'SET_MONEY',
			target === 'wallet' ? difference : 0,
			target === 'treasury' ? difference : 0,
			difference
		);

		return await ctx.embedify(
			'success',
			'user',
			`Set ${member}'s \`${target}\` to ${currency}${amount.toLocaleString()}.`,
			false
		);
	};
}
