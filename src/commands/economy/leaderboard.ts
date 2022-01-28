import { parseNumber } from '@adrastopoulos/number-parser';
import { MessageEmbed } from 'discord.js';

import { paginate } from '../../lib/util';
import { MemberModel } from '../../models';
import { BalanceString, Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View top funds.')
		.setGroup('ECONOMY')
		.setFormat('<wallet | treasury | total> [page]')
		.setExamples(['leaderboard wallet', 'leaderboard total 3'])
		.addStringOption((option) =>
			option
				.setName('type')
				.setDescription('Specify the type.')
				.addChoices([
					['Wallet', 'wallet'],
					['Treasury', 'treasury'],
					['Total', 'total'],
				])
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option.setName('page').setDescription('Specify a page.').setMinValue(1).setRequired(false)
		);

	execute = async (ctx: Context) => {
		const type = ctx.interaction.options.getString('type') as BalanceString;
		const page = ctx.interaction.options.getInteger('page', false) ?? 1;
		const { currency } = ctx.guildDocument;
		const members = await MemberModel.find({ guildId: ctx.guildDocument.guildId }).sort({ [type]: -1 });

		let entryCount = 10;
		const pageCount = Math.ceil(members.length / entryCount);
		const leaderBoardEntries: string[] = [];
		let rank = 1;

		members.forEach((member) => {
			const userId = member.userId;
			const balance = parseNumber(member[type]);
			leaderBoardEntries.push(`\`${rank++}\` • <@${userId}> | ${currency}${balance}\n`);
		});

		const embeds: MessageEmbed[] = [];
		let k = 0;
		for (let i = 0; i < pageCount; i++) {
			let description = '';
			for (let j = 0; j < entryCount; j++, k++) {
				if (leaderBoardEntries[k]) {
					description += leaderBoardEntries[k];
				}
			}

			const embed = new MessageEmbed()
				.setAuthor({
					name: `Leaderboard (${type})`,
					iconURL: ctx.interaction.guild.iconURL(),
				})
				.setColor('BLUE')
				.setDescription(description)
				.setFooter({ text: `page ${i + 1} of ${pageCount}` });

			embeds.push(embed);
		}

		await paginate(ctx.interaction, embeds, page - 1);
	};
}
