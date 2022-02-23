import { transaction, validateAmount } from '../../lib/index.js';
import { MemberModel } from '../../models/index.js';
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
		const { currency } = ctx.guildDocument;
		const target = ctx.interaction.options.getUser('user');
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);
		const { validated, result } = await validateAmount(ctx, 'wallet');
		if (!validated) return;
		await transaction(ctx.client, ctx.guildDocument, ctx.memberDocument, ctx.memberDocument, 'GIVE_PAYMENT', -result, 0);
		await transaction(ctx.client, ctx.guildDocument, targetDocument, ctx.memberDocument, 'RECEIVE_PAYMENT', result, 0);
		await ctx.embedify('success', 'user', `Paid ${target} ${currency}${result.toLocaleString()}`, false);
	};
}
