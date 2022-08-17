import { PermissionFlagsBits } from 'discord.js';

import { CURRENCY_SYMBOL } from '../../config';
import { VariableCollector } from '../../lib';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';
import { Emojis } from '../../typings';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('currency')
		.setDescription('Manage the server currency symbol')
		.setModule('ECONOMY')
		.setFormat('currency <view | set | reset> [channel]')
		.setExamples(['currency view', 'currency set 💵', 'currency reset'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execution = new Router()
		.get('', (ctx) => new ExecutionNode()
			.setName('Currency Symbol')
			.setDescription(`Current currency symbol: ${ctx.guildEntity.currency} (\`${ctx.guildEntity.currency}\`)`)
			.setOptions(
				['select', '/set', 'Set', 'Set a new currency symbol'],
				['select', '/reset', 'Reset', 'Reset the currency symbol'],
			))
		.get('/set', async (ctx) => {
			const currency = await new VariableCollector<string>()
				.setProperty('currency')
				.setPrompt('Enter the new guild currency')
				.setParser((msg) => msg.content)
				.execute(ctx);
			ctx.guildEntity.currency = currency;
			await ctx.guildEntity.save();
			return new ExecutionNode()
				.setName('Updating Currency...')
				.setDescription(`${Emojis.CHECK} Currency set to ${ctx.guildEntity.currency} (\`${ctx.guildEntity.currency}\`).`)
				.setOptions(['back', '']);
		})
		.get('/reset', async (ctx) => {
			ctx.guildEntity.currency = CURRENCY_SYMBOL;
			await ctx.guildEntity.save();
			return new ExecutionNode()
				.setName('Resetting Currency...')
				.setDescription(`${Emojis.CHECK} Currency reset to ${CURRENCY_SYMBOL} (\`${CURRENCY_SYMBOL}\`).`)
				.setOptions(['back', '']);
		});
}
