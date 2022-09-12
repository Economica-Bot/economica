import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { PermissionFlagsBits } from 'discord.js';

import { Member, User } from '../../entities';
import { recordTransaction } from '../../lib';
import { Command, CommandError, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
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

	public execution = new Router()
		.get('', async (ctx) => {
			const balance = ctx.interaction.options.getString('balance');
			const amount = parseString(ctx.interaction.options.getString('amount'));
			if (!amount) throw new CommandError(`Invalid amount: \`${amount}\``);
			const wallet = balance === 'wallet' ? amount : 0;
			const treasury = balance === 'treasury' ? amount : 0;
			const target = ctx.interaction.options.getMember('target');
			await User.upsert({ id: target.id }, ['id']);
			await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
			await recordTransaction(ctx.interaction.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'ADD_MONEY', wallet, treasury);

			return new ExecutionNode()
				.setName('Adding Money...')
				.setDescription(`Added ${ctx.guildEntity.currency} \`${parseNumber(amount)}\` to <@!${target.id}>'s \`${balance}\``);
		});
}
