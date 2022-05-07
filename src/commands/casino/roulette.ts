import { parseNumber } from '@adrastopoulos/number-parser';

import { recordTransaction } from '../../lib/transaction.js';
import { validateAmount } from '../../lib/validate.js';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

const BetTypes: Record<string, { values: number[], multiplier: number }> = {
	'1-18': { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], multiplier: 2 },
	'19-36': { values: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], multiplier: 2 },
	red: { values: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36], multiplier: 2 },
	black: { values: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35], multiplier: 2 },
	even: { values: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36], multiplier: 2 },
	odd: { values: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35], multiplier: 2 },
	first_dozen: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], multiplier: 2 },
	second_dozen: { values: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], multiplier: 2 },
	third_dozen: { values: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], multiplier: 2 },
	snake: { values: [1, 5, 9, 12, 13, 16, 19, 23, 27, 30, 32, 34], multiplier: 2 },
};

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('roulette')
		.setDescription('Play roulette')
		.setModule('CASINO')
		.setFormat('roulette')
		.setExamples([
			'roulette 100 red',
			'roulette 200 3rd',
		])
		.addStringOption((option) => option.setName('amount').setDescription('Specify a bet').setRequired(true))
		.addStringOption((option) => option
			.setName('type')
			.setDescription('Specify where the bet is placed')
			.addChoices(
				{ name: '1-18', value: '1-18' },
				{ name: '19-36', value: '19-36' },
				{ name: 'Red', value: 'red' },
				{ name: 'Black', value: 'black' },
				{ name: 'Even', value: 'even' },
				{ name: 'Odd', value: 'Odd' },
				{ name: '1st Dozen', value: 'first_dozen' },
				{ name: '2nd Dozen', value: 'second_dozen' },
				{ name: '3rd Dozen', value: 'third_dozen' },
				{ name: 'Snake', value: 'snake' },
			)
			.setRequired(true));

	public execute = async (ctx: Context): Promise<void> => {
		const type = BetTypes[ctx.interaction.options.getString('type')];
		const { validated, result } = await validateAmount(ctx, 'wallet');
		if (!validated) return;
		const ballResult = Math.floor(Math.random() * 37); // 0-36
		const proceeds = type.values.includes(ballResult) ? result * type.multiplier : result * -1;
		recordTransaction(ctx.client, ctx.guildEntity, ctx.memberEntity, ctx.clientMemberEntity, 'ROULETTE', proceeds, 0);
		if (proceeds > 0) {
			await ctx.embedify('success', 'user', `**The roulette ball landed on... \`${ballResult}\`**\n\n🎉**Huzzah!**\nYou won ${ctx.guildEntity.currency}${parseNumber(proceeds)}`).send();
			return;
		}

		await ctx.embedify('error', 'user', `**The roulette ball landed on... \`${ballResult}\`!**\n\n❌**Better Luck Next Time!**\nYou lost ${ctx.guildEntity.currency}${parseNumber(result)}`).send();
	};
}
