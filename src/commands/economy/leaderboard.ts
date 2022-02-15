import { parseNumber } from '@adrastopoulos/number-parser';
import { MessageEmbed } from 'discord.js';

import { paginate } from '../../lib';
import { Member, MemberModel } from '../../models';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View top funds.')
		.setModule('ECONOMY')
		.setFormat('<wallet | treasury | total> [page]')
		.setExamples(['leaderboard', 'leaderboard 3'])
		.addIntegerOption((option) =>
			option.setName('page').setDescription('Specify a page.').setMinValue(1).setRequired(false)
		);

	public execute = async (ctx: Context): Promise<void> => {
		const page = ctx.interaction.options.getInteger('page', false) ?? 1;
		const { currency } = ctx.guildDocument;
		const memberDocuments: Member[] = await MemberModel.aggregate([
			{
				$project: {
					userId: 1,
					wallet: 1,
					treasury: 1,
					total: {
						$add: ['$wallet', '$treasury'],
					},
				},
			},
			{
				$sort: {
					total: -1,
				},
			},
		]);

		let entryCount = 10;
		const pageCount = Math.ceil(memberDocuments.length / entryCount);
		const leaderBoardEntries: string[] = [];
		let rank = 1;

		for (const memberDocument of memberDocuments) {
			const userId = memberDocument.userId;
			const balance = parseNumber(memberDocument.wallet + memberDocument.treasury);
			leaderBoardEntries.push(`\`${rank++}\` • <@${userId}> | ${currency}${balance}\n`);
		}

		const embeds: MessageEmbed[] = [];
		let k = 0;
		for (let i = 0; i < pageCount; i++) {
			let description = '';
			for (let j = 0; j < entryCount; j++, k++) {
				if (leaderBoardEntries[k]) description += leaderBoardEntries[k];
			}

			const embed = ctx
				.embedify(
					'info',
					{ name: `${ctx.interaction.guild}'s Leaderboard`, iconURL: ctx.interaction.guild.iconURL() },
					description
				)
				.setFooter({ text: `page ${i + 1} of ${pageCount}` });
			embeds.push(embed);
		}

		await paginate(ctx.interaction, embeds, page - 1);
	};
}
