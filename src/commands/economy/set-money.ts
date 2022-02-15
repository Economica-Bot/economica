import { parseString } from '@adrastopoulos/number-parser';
import { GuildMember } from 'discord.js';

import { getEconInfo, transaction } from '../../lib';
import { MemberModel } from '../../models';
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
				.setName('balance')
				.setDescription('Specify where the money is added.')
				.addChoices([
					['wallet', 'wallet'],
					['treasury', 'treasury'],
				])
				.setRequired(true)
		);

	public execute = async (ctx: Context): Promise<void> => {
		const { currency } = ctx.guildDocument;
		const target = ctx.interaction.options.getMember('user') as GuildMember;
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		const amount = parseString(ctx.interaction.options.getString('amount'));
		const balance = ctx.interaction.options.getString('balance');
		const { wallet, treasury } = await getEconInfo(ctx.memberDocument);
		const difference = balance === 'wallet' ? amount - wallet : amount - treasury;
		const wallet_ = balance === 'wallet' ? difference : 0;
		const treasury_ = balance === 'treasury' ? difference : 0;
		if (!amount) return await ctx.embedify('error', 'user', 'Please enter a valid amount.', true);
		await transaction(
			ctx.client,
			ctx.guildDocument,
			targetDocument,
			ctx.memberDocument,
			'SET_MONEY',
			wallet_,
			treasury_
		);
		return await ctx.embedify(
			'success',
			'user',
			`Set ${target}'s \`${balance}\` to ${currency}${amount.toLocaleString()}.`,
			false
		);
	};
}
