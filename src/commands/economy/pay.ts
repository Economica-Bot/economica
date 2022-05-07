import { parseNumber } from '@adrastopoulos/number-parser';

import { Member, User } from '../../entities/index.js';
import { recordTransaction, validateAmount } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('pay')
		.setDescription('Transfer funds to another user')
		.setModule('ECONOMY')
		.setFormat('pay <user> <amount>')
		.setExamples(['pay @user 100', 'pay @user all'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const target = ctx.interaction.options.getUser('user');
		const targetEntity = await Member.findOne({ relations: ['user', 'guild'], where: { user: { id: target.id }, guild: { id: ctx.guildEntity.id } } })
			?? await (async () => {
				const user = await User.create({ id: target.id }).save();
				return Member.create({ user, guild: ctx.guildEntity }).save();
			})();
		const { validated, result } = await validateAmount(ctx, 'wallet');
		if (!validated) return;
		await ctx.embedify('success', 'user', `Paid ${target} ${ctx.guildEntity.currency}${parseNumber(result)}`).send();
		await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'GIVE_PAYMENT', -result, 0);
		await recordTransaction(ctx.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'RECEIVE_PAYMENT', result, 0);
	};
}
