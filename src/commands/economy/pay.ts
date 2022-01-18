import { parse_string } from '@adrastopoulos/number-parser';
import {
	Context,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	TransactionTypes,
} from '../../structures';
import { getEconInfo, transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('pay')
		.setDescription('Pay funds to another user.')
		.setGroup('economy')
		.setFormat('<user> <amount | all>')
		.setExamples(['pay @Wumpus all', 'pay @JohnDoe 100'])
		.setGlobal(false)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('amount').setDescription('Specify an amount').setRequired(true)
		);

	execute = async (ctx: Context) => {
		const { currency } = ctx.guildDocument;
		const user = ctx.interaction.options.getUser('user');
		const { wallet } = await getEconInfo(ctx.interaction.guildId, user.id);
		const amount = ctx.interaction.options.getString('amount');
		const result = amount === 'all' ? wallet : parse_string(amount);

		if (result) {
			if (result < 1) {
				return await ctx.interaction.reply(`Invalid amount: ${result}\nAmount less than 0`);
			}

			if (result > wallet) {
				return await ctx.interaction.reply(
					`Invalid amount: ${amount}\nExceeds current wallet:${currency}${wallet}`
				);
			}
		} else {
			return await ctx.interaction.reply(`Invalid amount: \`${result}\``);
		}

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			TransactionTypes.Pay,
			`Payment to  <@!${user.id}>`,
			-result,
			0,
			-result
		);

		await transaction(
			ctx.client,
			ctx.interaction.guild.id,
			user.id,
			TransactionTypes.Pay,
			`Payment from  <@!${ctx.interaction.id}>`,
			result,
			0,
			result
		);

		return await ctx.interaction.reply(
			`Payed <@!${user.id}> ${currency}${amount.toLocaleString()}`
		);
	};
}
