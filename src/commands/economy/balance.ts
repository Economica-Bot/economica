import { parseNumber } from '@adrastopoulos/number-parser';

import { Member, User } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionBuilder } from '../../structures';

export default class implements Command {
	public data = new EconomicaSlashCommandBuilder()
		.setName('balance')
		.setDescription('View a balance')
		.setModule('ECONOMY')
		.setFormat('balance [user]')
		.setExamples(['balance', 'balance @user'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(false));

	public execute = new ExecutionBuilder().setExecution(async (ctx) => {
		const target = ctx.interaction.options.getUser('user') ?? ctx.interaction.user;
		await User.upsert({ id: target.id }, ['id']);
		await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
		const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });
		await ctx
			.embedify('info', 'user')
			.setAuthor({ name: `${target.username}'s Balance`, iconURL: target.displayAvatarURL() })
			.addFields([
				{ name: 'Wallet', value: `${ctx.guildEntity.currency}${parseNumber(targetEntity.wallet)}`, inline: true },
				{ name: 'Treasury', value: `${ctx.guildEntity.currency}${parseNumber(targetEntity.treasury)}`, inline: true },
				{
					name: 'Total',
					value: `${ctx.guildEntity.currency}${parseNumber(targetEntity.wallet + targetEntity.treasury)}`,
					inline: true,
				},
			])
			.send();
	});
}
