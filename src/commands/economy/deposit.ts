import { parse_string } from '@adrastopoulos/number-parser';
import { MessageEmbed } from 'discord.js';
import {
	Context,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	TransactionTypes,
} from '../../structures';
import { getEconInfo, transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('deposit')
		.setDescription('Deposit funds from your wallet to your treasury.')
		.setGroup('economy')
		.setFormat('<amount | all>')
		.setExamples(['deposit all', 'deposit 100'])
		.setGlobal(false)
		.addStringOption((option) =>
			option.setName('amount').setDescription('Specify an amount').setRequired(true)
		);

	execute = async (ctx: Context) => {
		const { currency } = ctx.guildDocument;
		const { wallet } = await getEconInfo(ctx.interaction.guildId, ctx.interaction.user.id);
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
			TransactionTypes.Deposit,
			-result,
			result,
			0
		);

		const embed = new MessageEmbed()
			.setColor('GREEN')
			.setAuthor({
				name: ctx.interaction.user.username,
				url: ctx.interaction.user.displayAvatarURL(),
			})
			.setDescription(`Deposited ${currency}${result.toLocaleString()}`);

		return await ctx.interaction.reply({ embeds: [embed] });
	};
}
