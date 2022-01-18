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
		.setName('withdraw')
		.setDescription('Withdraw funds from your treasury to your wallet.')
		.setGroup('economy')
		.setFormat('<amount | all>')
		.setExamples(['withdraw all', 'withdraw 100'])
		.setGlobal(false)
		.addStringOption((option) =>
			option.setName('amount').setDescription('Specify an amount').setRequired(true)
		);

	execute = async (ctx: Context) => {
		const { currency } = ctx.guildDocument;
		const { treasury } = await getEconInfo(ctx.interaction.guildId, ctx.interaction.user.id);
		const amount = ctx.interaction.options.getString('amount');
		const result = amount === 'all' ? treasury : parse_string(amount);

		if (result) {
			if (result < 1) {
				return await ctx.interaction.reply(`Invalid amount: ${result}\nAmount less than 0`);
			}

			if (result > treasury) {
				return await ctx.interaction.reply(
					`Invalid amount: ${amount}\nExceeds current treasury:${currency}${treasury}`
				);
			}
		} else {
			return await ctx.interaction.reply(`Invalid amount: \`${result}\``);
		}

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			TransactionTypes.Withdraw,
			'`system`',
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
			.setDescription(`Withdrew ${currency}${result.toLocaleString()}`);

		return await ctx.interaction.reply({ embeds: [embed] });
	};
}
