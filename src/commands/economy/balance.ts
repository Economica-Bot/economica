import { parseNumber } from '@adrastopoulos/number-parser';
import { Member, User } from '../../entities';
import { Command, Context, EconomicaSlashCommandBuilder } from '../../structures/index.js';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('balance')
		.setDescription('View a balance')
		.setModule('ECONOMY')
		.setFormat('balance [user]')
		.setExamples(['balance', 'balance @user'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(false));

	public execute = async (ctx: Context): Promise<void> => {
		const target = ctx.interaction.options.getUser('user') ?? ctx.interaction.user;
		const targetEntity = await Member.findOne({ relations: ['user', 'guild'], where: { user: { id: target.id }, guild: ctx.guildEntity } })
		?? await (async () => {
			const user = await User.create({ id: target.id }).save();
			return Member.create({ user, guild: ctx.guildEntity }).save();
		})();
		const embed = ctx
			.embedify('info', { name: target.username, iconURL: target.displayAvatarURL() })
			.addFields(
				{ name: 'Wallet', value: `${ctx.guildEntity.currency}${parseNumber(targetEntity.wallet)}`, inline: true },
				{ name: 'Treasury', value: `${ctx.guildEntity.currency}${parseNumber(targetEntity.treasury)}`, inline: true },
				{ name: 'Total', value: `${ctx.guildEntity.currency}${parseNumber(targetEntity.wallet + targetEntity.treasury)}`, inline: true },
			);
		await ctx.interaction.reply({ embeds: [embed] });
	};
}
