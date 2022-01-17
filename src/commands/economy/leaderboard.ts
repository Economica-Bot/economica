import { CommandInteraction, MessageEmbed } from 'discord.js';
import { parse_number } from '@adrastopoulos/number-parser';
import { MemberModel } from '../../models';
import {
	EconomicaClient,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	BalanceTypes,
} from '../../structures';
import { getCurrencySymbol, paginate } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View top funds.')
		.setGroup('economy')
		.setFormat('<wallet | treasury | total> [page]')
		.setExamples(['leaderboard wallet', 'leaderboard total 3'])
		.setGlobal(false)
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
	execute = async (client: EconomicaClient, interaction: CommandInteraction) => {
		const guildID = interaction.guild.id;
		const cSymbol = await getCurrencySymbol(guildID);
		const type = interaction.options.getString('type') as BalanceTypes;
		const page = interaction.options.getInteger('page') || 1;

		const members = await MemberModel.find({ guildID }).sort({ wallet: -1 });

		let entryCount = 10;
		const pageCount = Math.ceil(members.length / entryCount);
		const leaderBoardEntries: string[] = [];
		let rank = 1;

		members.forEach((member) => {
			const userID = member.userID;
			const balance = parse_number(member[type]);
			leaderBoardEntries.push(`\`${rank++}\` • <@${userID}> | ${cSymbol}${balance}\n`);
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
					name: `${interaction.guild}'s ${type} Leaderboard`,
					iconURL: interaction.guild.iconURL(),
				})
				.setColor('BLUE')
				.setDescription(description)
				.setFooter({ text: `page ${i + 1} of ${pageCount}` });

			embeds.push(embed);
		}

		await paginate(interaction, embeds, page - 1);
	};
}
