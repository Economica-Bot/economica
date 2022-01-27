import { MessageEmbed } from 'discord.js';

import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';
import { getEconInfo } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('balance')
		.setDescription('View a balance.')
		.setGroup('economy')
		.setFormat('[user]')
		.setExamples(['balance', 'balance @JohnDoe'])
		.setGlobal(false)
		.addUserOption((option) => option.setName('user').setDescription('Specify a user.').setRequired(false));

	execute = async (ctx: Context) => {
		const user = ctx.interaction.options.getUser('user') ?? ctx.interaction.user;
		const { currency } = ctx.guildDocument;
		const { wallet, treasury, total, rank } = await getEconInfo(ctx.interaction.guildId, user.id);
		const embed = await ctx.embedify('info', { name: user.username, iconURL: user.displayAvatarURL() }, null, false);
		embed.setFooter({ text: `🏆 Rank ${rank}` }).addFields(
			{
				name: 'Wallet',
				value: `${currency}${wallet.toLocaleString()}`,
				inline: true,
			},
			{
				name: 'Treasury',
				value: `${currency}${treasury.toLocaleString()}`,
				inline: true,
			},
			{
				name: 'Total',
				value: `${currency}${total.toLocaleString()}`,
				inline: true,
			}
		);

		return await ctx.interaction.reply({ embeds: [embed] });
	};
}
