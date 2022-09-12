import { parseNumber } from '@adrastopoulos/number-parser';

import { Member, User } from '../../entities';
import { recordTransaction, validateAmount } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('pay')
		.setDescription('Transfer funds to another user')
		.setModule('ECONOMY')
		.setFormat('pay <user> <amount>')
		.setExamples(['pay @user 100', 'pay @user all'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true));

	public execution = new Router()
		.get('', async (ctx) => {
			const target = ctx.interaction.options.getUser('user');
			await User.upsert({ id: target.id }, ['id']);
			await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
			const amount = await validateAmount(ctx, 'wallet');
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.memberEntity, 'GIVE_PAYMENT', -amount, 0);
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'RECEIVE_PAYMENT', amount, 0);
			return new ExecutionNode()
				.setName('Paying...')
				.setDescription(`Paid ${target} ${ctx.guildEntity.currency} \`${parseNumber(amount)}\``);
		});
}