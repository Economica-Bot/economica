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
		.setName('crime')
		.setDescription('Crime to earn a sum.')
		.setGroup('income')
		.setGlobal(false);

	execute = async (ctx: Context) => {
		const { min, max, chance, minfine, maxfine } = config.commands.crime;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		if (Math.random() * 100 > chance) {
			const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);
			await transaction(
				ctx.client,
				ctx.interaction.guildId,
				ctx.interaction.user.id,
				ctx.client.user.id,
				TransactionTypes.Crime_Fine,
				0,
				-fine,
				-fine
			);

			const embed = new MessageEmbed()
				.setColor('GOLD')
				.setAuthor({
					name: ctx.interaction.user.tag,
					iconURL: ctx.interaction.user.displayAvatarURL(),
				})
				.setDescription(
					`You were caught and fined ${ctx.guildDocument.currency}${fine.toLocaleString()}`
				);

			return await ctx.interaction.reply({ embeds: [embed] });
		}

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.client.user.id,
			TransactionTypes.Crime_Success,
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
				`You committed a crime and earned ${ctx.guildDocument.currency}${amount.toLocaleString()}`
			);

		await ctx.interaction.reply({ embeds: [embed] });
	};
}
