import { getEconInfo, transaction } from '../../lib';
import { MemberModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('rob')
		.setDescription('Rob a user to earn a sum.')
		.setModule('INCOME')
		.setFormat('<user>')
		.setExamples(['rob @Wumpus'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user.').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const target = ctx.interaction.options.getUser('user');
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		const { wallet: targetWallet } = await getEconInfo(targetDocument);
		const amount = Math.ceil(Math.random() * targetWallet);
		const { currency } = ctx.guildDocument;
		const { chance, minfine, maxfine } = ctx.guildDocument.incomes.rob;
		const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);

		if (target.id === ctx.client.user.id) return await ctx.embedify('warn', 'user', `You cannot rob me!`, true);
		if (ctx.interaction.user.id === target.id)
			return await ctx.embedify('warn', 'user', 'You cannot rob yourself', true);
		if (targetWallet <= 0) return await ctx.embedify('warn', 'user', `<@!${target.id}> has no money to rob!`, true);

		if (Math.random() * 100 > chance) {
			await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'ROB_FINE', 0, -fine);
			return await ctx.embedify('warn', 'user', `You were caught and fined ${currency}${fine.toLocaleString()}`, false);
		}

		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, targetDocument, 'ROB_SUCCESS', amount, 0);
		await transaction(ctx.client, ctx.guildDocument, targetDocument, ctx.memberDocument, 'ROB_VICTIM', -amount, 0);
		return await ctx.embedify(
			'success',
			'user',
			`You stole ${currency}${amount.toLocaleString()} from ${target}.`,
			false
		);
	};
}
