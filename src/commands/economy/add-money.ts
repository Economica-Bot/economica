import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { PermissionFlagsBits } from 'discord.js';

import { Member, User } from '../../entities';
import { recordTransaction } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('add-money')
		.setDescription('Manipulate balances')
		.setModule('ECONOMY')
		.setFormat('add-money <user> <amount> <target>')
		.setExamples(['add-money @user 300 wallet', 'add-money @user 100 treasury'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addUserOption((option) => option.setName('target').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true))
		.addStringOption((option) => option
			.setName('balance')
			.setDescription('Specify the balance')
			.setRequired(true)
			.addChoices({ name: 'Wallet', value: 'wallet' }, { name: 'Treasury', value: 'treasury' }));

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		const amount = ctx.interaction.options.getString('amount');
		const balance = ctx.interaction.options.getString('balance');
		const parsedAmount = parseString(amount);
		if (!parsedAmount) {
			await ctx.embedify('error', 'user', `Invalid amount: \`${amount}\``).send(true);
			return;
		}

		const wallet = balance === 'wallet' ? parsedAmount : 0;
		const treasury = balance === 'treasury' ? parsedAmount : 0;
		const target = ctx.interaction.options.getMember('target');
		await User.upsert({ id: target.id }, ['id']);
		await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
		const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
		await ctx
			.embedify(
				'success',
				'user',
				`Added ${ctx.guildEntity.currency}${parseNumber(parsedAmount)} to <@!${target.id}>'s \`${balance}\`.`,
			)
			.send();
		await recordTransaction(ctx.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'ADD_MONEY', wallet, treasury);
	});
}
