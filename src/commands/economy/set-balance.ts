import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { PermissionFlagsBits } from 'discord.js';

import { Member, User } from '../../entities';
import { recordTransaction } from '../../lib';
import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('set-balance')
		.setDescription('Set a balance')
		.setModule('ECONOMY')
		.setFormat('set-balance <user> <amount> <target>')
		.setExamples(['set-balance @user 300 wallet', 'set-balance @user 100 treasury'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true))
		.addStringOption((option) => option
			.setName('balance')
			.setDescription('Specify the target balance')
			.setRequired(true)
			.addChoices({ name: 'wallet', value: 'wallet' }, { name: 'treasury', value: 'treasury' }));

	public execution = new ExecutionNode<'top'>()
		.setName('Setting Balance')
		.setValue('set-balance')
		.setDescription((ctx) => `Set <@${ctx.variables.target.id}>'s \`${ctx.variables.balance}\` to ${ctx.guildEntity.currency} \`${parseNumber(ctx.variables.amount)}\`.`)
		.setExecution(async (ctx) => {
			const target = ctx.interaction.options.getMember('user');
			await User.upsert({ id: target.id }, ['id']);
			await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
			const amount = parseString(ctx.interaction.options.getString('amount'));
			const balance = ctx.interaction.options.getString('balance');
			const { wallet: w, treasury: t } = targetEntity;
			const difference = balance === 'wallet' ? amount - w : amount - t;
			const wallet = balance === 'wallet' ? difference : 0;
			const treasury = balance === 'treasury' ? difference : 0;
			if (!amount) throw new CommandError('Invalid amount submitted.');
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'SET_MONEY', wallet, treasury);
		});
}
