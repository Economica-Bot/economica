import { getEconInfo, transaction } from '../../lib/index.js';
import { MemberModel } from '../../models/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('rob')
		.setDescription('Rob an innocent user for a sweet sum')
		.setModule('INCOME')
		.setFormat('rob <user>')
		.setExamples(['rob @Wumpus'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const target = ctx.interaction.options.getUser('user');
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		const { wallet: targetWallet } = await getEconInfo(targetDocument);
		const amount = Math.ceil(Math.random() * targetWallet);
		const { chance, minfine, maxfine } = ctx.guildDocument.incomes.rob;
		const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);
		if (target.id === ctx.client.user.id) return ctx.embedify('warn', 'user', 'You cannot rob me!', true);
		if (ctx.interaction.user.id === target.id) { return ctx.embedify('warn', 'user', 'You cannot rob yourself', true); }
		if (targetWallet <= 0) return ctx.embedify('warn', 'user', `<@!${target.id}> has no money to rob!`, true);
		if (Math.random() * 100 > chance) {
			await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.clientDocument, 'ROB_FINE', 0, -fine);
			return ctx.embedify('warn', 'user', `You were caught and fined ${ctx.guildDocument.currency}${fine.toLocaleString()}`, false);
		}

		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, targetDocument, 'ROB_SUCCESS', amount, 0);
		await transaction(ctx.client, ctx.guildDocument, targetDocument, ctx.memberDocument, 'ROB_VICTIM', -amount, 0);
		return ctx.embedify('success', 'user', `You stole ${ctx.guildDocument.currency}${amount.toLocaleString()} from ${target}.`, false);
	};
}
