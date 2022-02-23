import { parseString } from '@adrastopoulos/number-parser';
import { GuildMember } from 'discord.js';

import { getEconInfo, transaction } from '../../lib/index.js';
import { MemberModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('set-money')
		.setDescription('Set a balance')
		.setModule('ECONOMY')
		.setFormat('set-money <user> <amount> <target>')
		.setExamples(['set-money @user 300 wallet', 'set-money @user 100 treasury'])
		.setAuthority('MANAGER')
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true))
		.addStringOption((option) => option
			.setName('balance')
			.setDescription('Specify the target balance')
			.addChoices([['wallet', 'wallet'], ['treasury', 'treasury']])
			.setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const { currency } = ctx.guildDocument;
		const target = ctx.interaction.options.getMember('user') as GuildMember;
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		const amount = parseString(ctx.interaction.options.getString('amount'));
		const balance = ctx.interaction.options.getString('balance');
		const { wallet: w, treasury: t } = await getEconInfo(ctx.memberDocument);
		const difference = balance === 'wallet' ? amount - w : amount - t;
		const wallet = balance === 'wallet' ? difference : 0;
		const treasury = balance === 'treasury' ? difference : 0;
		if (!amount) return ctx.embedify('error', 'user', 'Please enter a valid amount.', true);
		await transaction(ctx.client, ctx.guildDocument, targetDocument, ctx.memberDocument, 'SET_MONEY', wallet, treasury);
		return ctx.embedify('success', 'user', `Set ${target}'s \`${balance}\` to ${currency}${amount.toLocaleString()}.`, false);
	};
}
