import { getEconInfo } from '../../lib';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder } from '../../structures';

export default class extends EconomicaCommand {
	public data = new EconomicaSlashCommandBuilder()
		.setName('balance')
		.setDescription('View a balance.')
		.setGroup('ECONOMY')
		.setFormat('[user]')
		.setExamples(['balance', 'balance @JohnDoe'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user.').setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		const user = ctx.interaction.options.getUser('user') ?? ctx.interaction.user;
		const { currency } = ctx.guildDocument;
		const { wallet, treasury, total, rank } = await getEconInfo(ctx.interaction.guildId, user.id);
		const embed = ctx
			.embedify('info', { name: user.username, iconURL: user.displayAvatarURL() })
			.setFooter({ text: `🏆 Rank ${rank}` })
			.addFields(
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
