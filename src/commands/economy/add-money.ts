import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { GuildMember } from 'discord.js';

import { transaction } from '../../lib';
import { MemberModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('add-money')
		.setDescription('Add/remove money from a balance.')
		.setModule('ECONOMY')
		.setFormat('<user> <amount> <target>')
		.setExamples(['add-money @JohnDoe 300 wallet', 'add-money @Wumpus 100 treasury'])
		.setAuthority('MANAGER')
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true))
		.addStringOption((option) =>
			option
				.setName('balance')
				.setDescription('Specify the balance to which money is added.')
				.addChoices([
					['Wallet', 'wallet'],
					['Treasury', 'treasury'],
				])
				.setRequired(true)
		);

	public execute = async (ctx: Context): Promise<void> => {
		const { currency } = ctx.guildDocument;
		const amount = ctx.interaction.options.getString('amount');
		const balance = ctx.interaction.options.getString('balance');
		const parsedAmount = parseString(amount);
		const wallet = balance === 'wallet' ? parsedAmount : 0;
		const treasury = balance === 'treasury' ? parsedAmount : 0;
		const target_ = ctx.interaction.options.getMember('user') as GuildMember;
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target_.id },
			{ guild: ctx.guildDocument, userId: target_.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);

		if (!parsedAmount) return await ctx.embedify('error', 'user', `Invalid amount: \`${amount}\``, true);
		await transaction(ctx.client, ctx.guildDocument, targetDocument, ctx.clientDocument, 'ADD_MONEY', wallet, treasury);
		return await ctx.embedify(
			'success',
			'user',
			`Added ${currency}${parseNumber(parsedAmount)} to <@!${target_.id}>'s \`${balance}\`.`,
			false
		);
	};
}
