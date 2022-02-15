import { transaction, validateAmount } from '../../lib';
import { MemberModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('pay')
		.setDescription('Pay funds to another user.')
		.setModule('ECONOMY')
		.setFormat('<user> <amount | all>')
		.setExamples(['pay @Wumpus all', 'pay @JohnDoe 100'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const { currency } = ctx.guildDocument;
		const target = ctx.interaction.options.getUser('user');
		const targetDocument = await MemberModel.findOneAndUpdate(
			{ guild: ctx.guildDocument, userId: target.id },
			{ guild: ctx.guildDocument, userId: target.id },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);

		const { validated, result } = await validateAmount(ctx, 'wallet');
		if (!validated) return;
		await transaction(
			ctx.client,
			ctx.guildDocument,
			ctx.memberDocument,
			ctx.memberDocument,
			'GIVE_PAYMENT',
			-result,
			0
		);
		await transaction(ctx.client, ctx.guildDocument, targetDocument, ctx.memberDocument, 'RECEIVE_PAYMENT', result, 0);
		return await ctx.embedify('success', 'user', `Paid ${target} ${currency}${result.toLocaleString()}`, false);
	};
}
