import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { GuildMember } from 'discord.js';

import { transaction } from '../../lib/index.js';
import { MemberModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('add-money')
		.setDescription('Manipulate balances')
		.setModule('ECONOMY')
		.setFormat('add-money <user> <amount> <target>')
		.setExamples(['add-money @user 300 wallet', 'add-money @user 100 treasury'])
		.setAuthority('MANAGER')
		.addUserOption((option) => option.setName('target').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true))
		.addStringOption((option) => option
			.setName('balance')
			.setDescription('Specify the balance')
			.addChoices([
				['Wallet', 'wallet'],
				['Treasury', 'treasury'],
			])
			.setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const { currency } = ctx.guildDocument;
		const amount = ctx.interaction.options.getString('amount');
		const balance = ctx.interaction.options.getString('balance');
		const parsedAmount = parseString(amount);
		const wallet = balance === 'wallet' ? parsedAmount : 0;
		const treasury = balance === 'treasury' ? parsedAmount : 0;
		const target = ctx.interaction.options.getMember('target') as GuildMember;
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		if (!parsedAmount) {
			await ctx.embedify('error', 'user', `Invalid amount: \`${amount}\``, true);
		} else {
			await transaction(ctx.client, ctx.guildDocument, targetDocument, ctx.clientDocument, 'ADD_MONEY', wallet, treasury);
			await ctx.embedify('success', 'user', `Added ${currency}${parseNumber(parsedAmount)} to <@!${target.id}>'s \`${balance}\`.`, false);
		}
	};
}
