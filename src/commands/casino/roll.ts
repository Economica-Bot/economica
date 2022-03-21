import { parseNumber } from '@adrastopoulos/number-parser';
import { recordTransaction, validateAmount } from '../../lib/index.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll a six sided die to win some cash')
		.setModule('CASINO')
		.setFormat('roll <amount> <number>')
		.setExamples([
			'dice 100 3',
			'dice 4000 5',
		])
		.setAuthority('USER')
		.setDefaultPermission(false)
		.addStringOption((option) => option.setName('amount').setDescription('Specify a bet').setRequired(true))
		.addIntegerOption((option) => option.setName('number').setDescription('Choose a number on the die').setMinValue(1).setMaxValue(6).setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const number = ctx.interaction.options.getInteger('number');
		const { validated, result } = await validateAmount(ctx, 'wallet');
		if (!validated) return;
		const diceRoll = Math.floor(Math.random() * 6 + 1);
		const proceeds = diceRoll === number ? result * 4 : result * -1;
		await recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'DICE_ROLL', proceeds, 0);
		if (proceeds > 0) {
			await ctx.embedify('success', 'user', `**The die landed on... \`${diceRoll}\`**\n\n🎉**Huzzah!**\nYou won ${ctx.guildEntity.currency}${parseNumber(result * 4)}`).send();
			return;
		}

		await ctx.embedify('error', 'user', `**The die landed on... \`${diceRoll}\`!**\n\n❌**Better Luck Next Time!**\nYou lost ${ctx.guildEntity.currency}${parseNumber(result)}`).send();
	};
}
