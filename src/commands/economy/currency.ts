import { PermissionFlagsBits } from 'discord.js';

import { CURRENCY_SYMBOL } from '../../config';
import { VariableCollector } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('currency')
		.setDescription('Manage the server currency symbol')
		.setModule('ECONOMY')
		.setFormat('currency <view | set | reset> [channel]')
		.setExamples(['currency view', 'currency set 💵', 'currency reset'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execution = new ExecutionNode()
		.setName('Currency Symbol')
		.setValue('currency')
		.setDescription((ctx) => `Current currency symbol: ${ctx.guildEntity.currency} (\`${ctx.guildEntity.currency}\`)`)
		.setOptions(() => [
			new ExecutionNode<'select'>()
				.setName('Set')
				.setValue('currency_set')
				.setType('select')
				.setDescription('Set the currency')
				.setExecution(async (ctx) => {
					const currency = await new VariableCollector<string>()
						.setProperty('currency')
						.setPrompt('Enter the new guild currency')
						.setParser((msg) => msg.content)
						.execute(ctx);
					ctx.guildEntity.currency = currency;
					await ctx.guildEntity.save();
				})
				.setOptions((ctx) => [
					new ExecutionNode()
						.setName('Currency updated!')
						.setValue('currency_set_result')
						.setType('display')
						.setDescription(`Currency set to ${ctx.guildEntity.currency} (\`${ctx.guildEntity.currency}\`).`),
				]),
			new ExecutionNode()
				.setName('Reset')
				.setValue('currency_reset')
				.setType('select')
				.setDescription('Reset the currency')
				.setExecution(async (ctx) => {
					ctx.guildEntity.currency = CURRENCY_SYMBOL;
					await ctx.guildEntity.save();
				})
				.setOptions(() => [new ExecutionNode()
					.setName('Currency reset!')
					.setValue('currency_reset_result')
					.setType('display')
					.setDescription(`Currency reset to ${CURRENCY_SYMBOL} (\`${CURRENCY_SYMBOL}\`).`)]),
		]);
}
