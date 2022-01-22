import { MessageEmbed } from 'discord.js';
import * as config from '../../../config.json';
import {
	Context,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	TransactionTypes,
} from '../../structures';
import { transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('beg')
		.setDescription('Beg to earn a sum.')
		.setGroup('income')
		.setGlobal(false);

	execute = async (ctx: Context) => {
		const { min, max, chance } = config.commands.beg;
		if (Math.random() * 100 > chance) {
			const embed = new MessageEmbed()
				.setColor('GOLD')
				.setAuthor({
					name: ctx.interaction.user.tag,
					iconURL: ctx.interaction.user.displayAvatarURL(),
				})
				.setDescription('You begged and earned nothing :sad:');

			return await ctx.interaction.reply({ embeds: [embed] });
		}

		const amount = Math.ceil(Math.random() * (max - min) + min);
		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.client.user.id,
			TransactionTypes.Beg,
			amount,
			0,
			amount
		);

		const embed = new MessageEmbed()
			.setColor('GOLD')
			.setAuthor({
				name: ctx.interaction.user.tag,
				iconURL: ctx.interaction.user.displayAvatarURL(),
			})
			.setDescription(
				`You begged and earned ${ctx.guildDocument.currency}${amount.toLocaleString()}`
			);

		await ctx.interaction.reply({ embeds: [embed] });
	};
}
