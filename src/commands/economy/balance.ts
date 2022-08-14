import { parseNumber } from '@adrastopoulos/number-parser';

import { Member, User } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('balance')
		.setDescription('View a balance')
		.setModule('ECONOMY')
		.setFormat('balance [user]')
		.setExamples(['balance', 'balance @user'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(false));

	public execution = new ExecutionNode<'top'>()
		.setName('Balance')
		.setValue('balance')
		.setDescription('Viewing balances')
		.setPagination(
			async (ctx) => {
				const target = ctx.interaction.options.getUser('user') ?? ctx.interaction.user;
				await User.upsert({ id: target.id }, ['id']);
				await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
				const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
				return {
					targetEntity,
					currency: ctx.guildEntity.currency,
				};
			},
			({ targetEntity, currency }) => [
				new ExecutionNode()
					.setName('Wallet')
					.setValue('balance_wallet')
					.setType('displayInline')
					.setDescription(() => `${currency} \`${parseNumber(targetEntity.wallet)}\``),
				new ExecutionNode()
					.setName('Treasury')
					.setValue('balance_treasury')
					.setType('displayInline')
					.setDescription(() => `${currency} \`${parseNumber(targetEntity.treasury)}\``),
				new ExecutionNode()
					.setName('Total')
					.setValue('balance_total')
					.setType('displayInline')
					.setDescription(() => `${currency} \`${parseNumber(targetEntity.wallet + targetEntity.treasury)}\``),
			],
		)
		.setOptions(async (ctx) => {
			const target = ctx.interaction.options.getUser('user') ?? ctx.interaction.user;
			await User.upsert({ id: target.id }, ['id']);
			await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
			return [
				new ExecutionNode()
					.setName('Wallet')
					.setValue('balance_wallet')
					.setType('displayInline')
					.setDescription(() => `${ctx.guildEntity.currency} \`${parseNumber(targetEntity.wallet)}\``),
				new ExecutionNode()
					.setName('Treasury')
					.setValue('balance_treasury')
					.setType('displayInline')
					.setDescription(() => `${ctx.guildEntity.currency} \`${parseNumber(targetEntity.treasury)}\``),
				new ExecutionNode()
					.setName('Total')
					.setValue('balance_total')
					.setType('displayInline')
					.setDescription(() => `${ctx.guildEntity.currency} \`${parseNumber(targetEntity.wallet + targetEntity.treasury)}\``),
			];
		});
}
