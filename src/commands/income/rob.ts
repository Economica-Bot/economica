import { parseNumber } from '@adrastopoulos/number-parser';

import { Member, User } from '../../entities/index.js';
import { recordTransaction } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('rob')
		.setDescription('Rob an innocent user for a sweet sum')
		.setModule('INCOME')
		.setFormat('rob <user>')
		.setExamples(['rob @QiNG-agar'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const target = ctx.interaction.options.getUser('user');
		const targetEntity = await Member.findOne({ user: { id: target.id }, guild: ctx.guildEntity })
			?? await (async () => {
				const user = await User.create({ id: target.id }).save();
				return Member.create({ user, guild: ctx.guildEntity }).save();
			})();
		const amount = Math.ceil(Math.random() * targetEntity.wallet);
		const { chance, minfine, maxfine } = ctx.guildEntity.incomes.rob;
		const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);
		if (target.id === ctx.client.user.id) {
			await ctx.embedify('warn', 'user', 'You cannot rob me!', true);
			return;
		}
		if (ctx.interaction.user.id === target.id) {
			await ctx.embedify('warn', 'user', 'You cannot rob yourself', true);
			return;
		}
		if (targetEntity.wallet <= 0) {
			await ctx.embedify('warn', 'user', `<@!${target.id}> has no money to rob!`, true);
			return;
		}
		if (Math.random() * 100 > chance) {
			await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'ROB_FINE', 0, -fine);
			await ctx.embedify('warn', 'user', `You were caught and fined ${ctx.guildEntity.currency}${fine.toLocaleString()}`, false);
			return;
		}
		await ctx.embedify('success', 'user', `You stole ${ctx.guildEntity.currency}${parseNumber(amount)} from ${target}.`, false);
		await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, targetEntity, 'ROB_SUCCESS', amount, 0);
		await recordTransaction(ctx.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'ROB_VICTIM', -amount, 0);
	};
}
