import { Member } from '../../entities';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('balance')
		.setDescription('View a balance')
		.setModule('ECONOMY')
		.setFormat('balance [user]')
		.setExamples(['balance', 'balance @user'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		const user = ctx.interaction.options.getUser('user') ?? ctx.interaction.user;
		const targetEntity = await Member.findOne({ user: { id: user.id }, guild: { id: ctx.interaction.guild.id } })
			?? await Member.create({ user: { id: user.id }, guild: { id: ctx.interaction.guild.id } }).save();
		const embed = ctx
			.embedify('info', { name: user.username, iconURL: user.displayAvatarURL() })
			.addFields(
				{ name: 'Wallet', value: `${ctx.guildEntity.currency}${targetEntity.wallet.toLocaleString()}`, inline: true },
				{ name: 'Treasury', value: `${ctx.guildEntity.currency}${targetEntity.treasury.toLocaleString()}`, inline: true },
				{ name: 'Total', value: `${ctx.guildEntity.currency}${(targetEntity.wallet + targetEntity.treasury).toLocaleString()}`, inline: true },
			);
		await ctx.interaction.reply({ embeds: [embed] });
	};
}
