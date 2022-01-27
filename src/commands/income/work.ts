import { MessageEmbed } from 'discord.js';

import { economyDefaults } from '../../config';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { transaction } from '../../lib/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('work')
		.setDescription('Work to earn a sum.')
		.setGroup('income')
		.setGlobal(false);

	execute = async (ctx: Context) => {
		const { min, max } = economyDefaults.work;
		const amount = Math.ceil(Math.random() * (max - min) + min);
		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			ctx.interaction.user.id,
			ctx.client.user.id,
			'WORK',
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
			.setDescription(`You worked and earned ${ctx.guildDocument.currency}${amount.toLocaleString()}`);

		await ctx.interaction.reply({ embeds: [embed] });
	};
}
