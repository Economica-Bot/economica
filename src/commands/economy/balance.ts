import { parseNumber } from '@adrastopoulos/number-parser';

import { Member, User } from '../../entities';
import { Command, EconomicaSlashCommandBuilder, ExecutionNode, Router } from '../../structures';

export default class implements Command {
	public metadata = new EconomicaSlashCommandBuilder()
		.setName('balance')
		.setDescription('View a balance')
		.setModule('ECONOMY')
		.setFormat('balance [user]')
		.setExamples(['balance', 'balance @user'])
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(false));

	public execution = new Router()
		.get('', async (ctx) => {
			const target = ctx.interaction.options.getUser('user') ?? ctx.interaction.user;
			await User.upsert({ id: target.id }, ['id']);
			await Member.upsert({ userId: target.id, guildId: ctx.guildEntity.id }, ['userId', 'guildId']);
			const targetEntity = await Member.findOneBy({ userId: target.id, guildId: ctx.guildEntity.id });

			return new ExecutionNode()
				.setName('Balance')
				.setDescription(`Viewing ${target}'s Balance`)
				.setOptions(
					['displayInline', 'Wallet', `${ctx.guildEntity.currency} \`${parseNumber(targetEntity.wallet)}\``],
					['displayInline', 'Treasury', `${ctx.guildEntity.currency} \`${parseNumber(targetEntity.treasury)}\``],
					['displayInline', 'Total', `${ctx.guildEntity.currency} \`${parseNumber(targetEntity.wallet + targetEntity.treasury)}\``],
				);
		});
}
