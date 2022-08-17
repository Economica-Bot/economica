import { parseNumber } from '@adrastopoulos/number-parser';

import { Member, User } from '../../entities';
import { recordTransaction } from '../../lib';
import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('rob')
		.setDescription('Rob an innocent user for a sweet sum')
		.setModule('INCOME')
		.setFormat('rob <user>')
		.setExamples(['rob @QiNG-agar'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true));

	public execution = new Router()
		.get('', async (ctx) => {
			const target = ctx.interaction.options.getUser('user');
			await User.upsert({ id: target.id }, ['id']);
			await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
			const amount = Math.ceil(Math.random() * targetEntity.wallet);
			const { chance, minfine, maxfine } = ctx.guildEntity.incomes.rob;
			const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);
			if (target.id === ctx.interaction.client.user.id) throw new CommandError('You cannot rob me!');
			if (ctx.interaction.user.id === target.id) throw new CommandError('You cannot rob yourself');
			if (targetEntity.wallet <= 0) throw new CommandError(`<@!${target.id}> has no money to rob!`);
			if (Math.random() * 100 > chance) {
				await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'ROB_FINE', 0, -fine);
				throw new CommandError(`You were caught and fined ${ctx.guildEntity.currency} \`${parseNumber(fine)}\``);
			}
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, ctx.memberEntity, targetEntity, 'ROB_SUCCESS', amount, 0);
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'ROB_VICTIM', -amount, 0);
			return new ExecutionNode()
				.setName('Successful Heist!?')
				.setDescription(`You stole ${ctx.guildEntity.currency} \`${parseNumber(amount)}\` from ${target}.`);
		});
}
