import { parseNumber } from '@adrastopoulos/number-parser';
import { MessageEmbed } from 'discord.js';

import { paginate } from '../../lib';
import { Member } from '../../entities';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View top balances')
		.setModule('ECONOMY')
		.setFormat('leaderboard [page]')
		.setExamples(['leaderboard', 'leaderboard 3'])
		.addIntegerOption((option) => option.setName('page').setDescription('Specify a page').setMinValue(1).setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		const page = ctx.interaction.options.getInteger('page', false) ?? 1;
		const members = await Member
			.createQueryBuilder('member')
			.select('SUM(user.wallet + user.treasury)')
			.where('member.guild = :id', { id: ctx.interaction.guildId })
			.getMany();
		const entryCount = 10;
		const pageCount = Math.ceil(members.length / entryCount);
		const leaderBoardEntries: string[] = [];
		let rank = 1;
		members.forEach((member) => {
			const balance = parseNumber(member.wallet + member.treasury);
			leaderBoardEntries.push(`\`${rank += 1}\` • <@${member.user.id}> | ${ctx.guildEntity}${balance}\n`);
		});
		const embeds: MessageEmbed[] = [];
		let k = 0;
		for (let i = 0; i < pageCount; i++) {
			let description = '';
			for (let j = 0; j < entryCount; j++, k++) {
				if (leaderBoardEntries[k]) description += leaderBoardEntries[k];
			}

			const embed = ctx
				.embedify('info', { name: `${ctx.interaction.guild}'s Leaderboard`, iconURL: ctx.interaction.guild.iconURL() }, description)
				.setFooter({ text: `page ${i + 1} of ${pageCount}` });
			embeds.push(embed);
		}

		await paginate(ctx.interaction, embeds, page - 1);
	};
}
