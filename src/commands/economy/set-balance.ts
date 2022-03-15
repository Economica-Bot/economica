import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { GuildMember } from 'discord.js';

import { recordTransaction } from '../../lib';
import { Member, User } from '../../entities';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('set-balance')
		.setDescription('Set a balance')
		.setModule('ECONOMY')
		.setFormat('set-balance <user> <amount> <target>')
		.setExamples(['set-balance @user 300 wallet', 'set-balance @user 100 treasury'])
		.setAuthority('MANAGER')
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true))
		.addStringOption((option) => option
			.setName('balance')
			.setDescription('Specify the target balance')
			.addChoices([['wallet', 'wallet'], ['treasury', 'treasury']])
			.setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const target = ctx.interaction.options.getMember('user') as GuildMember;
		const targetEntity = await Member.findOne({ relations: ['user', 'guild'], where: { user: { id: target.id }, guild: ctx.guildEntity } })
			?? await (async () => {
				const user = await User.create({ id: target.id }).save();
				return Member.create({ user, guild: ctx.guildEntity }).save();
			})();
		const amount = parseString(ctx.interaction.options.getString('amount'));
		const balance = ctx.interaction.options.getString('balance');
		const { wallet: w, treasury: t } = targetEntity;
		const difference = balance === 'wallet' ? amount - w : amount - t;
		const wallet = balance === 'wallet' ? difference : 0;
		const treasury = balance === 'treasury' ? difference : 0;
		if (!amount) {
			await ctx.embedify('error', 'user', 'Please enter a valid amount.').send(true);
			return;
		}
		await ctx.embedify('success', 'user', `Set ${target}'s \`${balance}\` to ${ctx.guildEntity.currency}${parseNumber(amount)}.`).send();
		await recordTransaction(ctx.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'SET_MONEY', wallet, treasury);
	};
}
