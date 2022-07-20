import { PermissionFlagsBits } from 'discord.js';

import { CURRENCY_SYMBOL } from '../../config';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('currency')
		.setDescription('Manage the server currency symbol')
		.setModule('ECONOMY')
		.setFormat('currency <view | set | reset> [channel]')
		.setExamples(['currency view', 'currency set 💵', 'currency reset'])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	public execute = new ExecutionBuilder()
		.setName('Currency Symbol')
		.setValue('currency')
		.setDescription('Manage the server currency symbol')
		.setOptions([
			new ExecutionBuilder()
				.setName('View')
				.setValue('view')
				.setDescription('View the current currency symbol')
				.setExecution(async (ctx, interaction) => {
					const embed = ctx.embedify(
						'info',
						'user',
						`The server currency is ${ctx.guildEntity.currency}. (\`${ctx.guildEntity.currency}\`)`,
					);
					await interaction.update({ embeds: [embed], components: [] });
				}),
			new ExecutionBuilder()
				.setName('Set')
				.setValue('set')
				.setDescription('Set the currency')
				.setExecution(async (ctx, interaction) => {
					await interaction.reply({ content: 'Enter the new currency', ephemeral: true });
					const msgs = await interaction.channel.awaitMessages({
						max: 1,
						filter: (msg) => msg.author.id === ctx.interaction.user.id,
					});
					const currency = msgs.first().content;
					ctx.guildEntity.currency = currency;
					await ctx.guildEntity.save();
					const embed = ctx.embedify('success', 'user', `Currency set to \`${currency}\`.`);
					await interaction.followUp({ embeds: [embed], components: [] });
				}),
			new ExecutionBuilder()
				.setName('Reset')
				.setValue('reset')
				.setDescription('Reset the currency')
				.setExecution(async (ctx, interaction) => {
					ctx.guildEntity.currency = CURRENCY_SYMBOL;
					await ctx.guildEntity.save();
					const embed = ctx.embedify('info', 'user', 'Currency reset.');
					await interaction.update({ embeds: [embed], components: [] });
				}),
		]);
}
