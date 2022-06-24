import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { PermissionFlagsBits } from 'discord.js';

import { Member, User } from '../../entities';
import { recordTransaction } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

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
		.addStringOption((option) => option.setName('balance').setDescription('Specify the target balance').setRequired(true).addChoices(
			{ name: 'wallet', value: 'wallet' },
			{ name: 'treasury', value: 'treasury' },
		));

	public execute = new ExecutionBuilder()
		.setExecution(async (ctx) => {
			const target = ctx.interaction.options.getMember('user');
			const targetEntity = await Member.findOne({ relations: ['user', 'guild'], where: { user: { id: target.id }, guild: { id: ctx.guildEntity.id } } })
				?? await (async () => {
					const user = await User.create({ id: target.id }).save();
					return Member.create({ user, guild: ctx.guildEntity }).save();
				})();
			const amount = parseString(ctx.interaction.options.getString('amount'));
			const balance = ctx.interaction.options.getString('balance');
			const { wallet: w, treasury: t } = targetEntity;
			const difference = balance === 'wallet' ? amount - w : amount - t;
			const wallet = balance === 'wallet' ? difference : 0;
			const treasury = balance === 'treasury' ? difference : 0;
			if (!amount) {
				await ctx.embedify('error', 'user', 'Please enter a valid amount.').send(true);
				return;
			}
			await ctx.embedify('success', 'user', `Set ${target}'s \`${balance}\` to ${ctx.guildEntity.currency}${parseNumber(amount)}.`).send();
			await recordTransaction(ctx.client, ctx.guildEntity, targetEntity, ctx.memberEntity, 'SET_MONEY', wallet, treasury);
		});
}
