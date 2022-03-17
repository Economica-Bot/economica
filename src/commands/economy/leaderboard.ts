import { parseNumber } from '@adrastopoulos/number-parser';
import { EmbedBuilder } from 'discord.js';

import { paginate } from '../../lib';
import { Member } from '../../entities';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View top balances')
		.setModule('ECONOMY')
		.setFormat('leaderboard [page]')
		.setExamples(['leaderboard', 'leaderboard 3'])
		.setAuthority('USER')
		.setDefaultPermission(false)
		.addIntegerOption((option) => option.setName('page').setDescription('Specify a page').setMinValue(1).setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		const page = ctx.interaction.options.getInteger('page', false) ?? 1;
		const members = await Member
			.createQueryBuilder('member')
			.where('member.guild = :id', { id: ctx.interaction.guildId })
			.leftJoinAndSelect('member.user', 'user')
			.orderBy('"treasury" + "wallet"', 'DESC')
			.getMany();
		const entryCount = 10;
		const pageCount = Math.ceil(members.length / entryCount);
		const leaderBoardEntries: string[] = [];
		let rank = 0;
		members.forEach((member) => {
			const balance = parseNumber(member.wallet + member.treasury);
			leaderBoardEntries.push(`\`${rank += 1}\` • <@${member.user.id}> | ${ctx.guildEntity.currency}${balance}\n`);
		});
		const embeds: EmbedBuilder[] = [];
		let k = 0;
		for (let i = 0; i < pageCount; i++) {
			let description = '';
			for (let j = 0; j < entryCount; j++, k++) {
				if (leaderBoardEntries[k]) description += leaderBoardEntries[k];
			}

			const embed = ctx
				.embedify('info', null, description)
				.setAuthor({ name: `${ctx.interaction.guild}'s Leaderboard`, iconURL: ctx.interaction.guild.iconURL() })
				.setFooter({ text: `page ${i + 1} of ${pageCount}` });
			embeds.push(embed);
		}

		await paginate(ctx.interaction, embeds, page - 1);
	};
}
