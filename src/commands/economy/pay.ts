import { transaction, validateAmount } from '../../lib';
import { Member } from '../../entities';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';

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
		const targetEntity = await Member.findOne({ user: { id: target.id }, guild: { id: ctx.interaction.guild.id } }) ?? await Member.create({ user: { id: target.id }, guild: { id: ctx.interaction.guild.id } }).save();
		const { validated, result } = await validateAmount(ctx, 'wallet');
		if (!validated) return;
		await transaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'GIVE_PAYMENT', -result, 0);
		await transaction(ctx.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'RECEIVE_PAYMENT', result, 0);
		await ctx.embedify('success', 'user', `Paid ${target} ${ctx.guildEntity.currency}${result.toLocaleString()}`, false);
	};
}
