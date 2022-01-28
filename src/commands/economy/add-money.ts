import { parseNumber, parseString } from '@adrastopoulos/number-parser';
import { GuildMember } from 'discord.js';

import { transaction } from '../../lib/util';
import { Context, EconomicaCommand, EconomicaSlashCommandBuilder, PermissionRole } from '../../structures';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('add-money')
		.setDescription('Add/remove funds from a balance.')
		.setGroup('economy')
		.setFormat('<user> <amount> <target>')
		.setExamples(['add-money @JohnDoe 300 wallet', 'add-money @Wumpus 100 treasury'])
		.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
		.setGlobal(false)
		.addUserOption((option) => option.setName('user').setDescription('Specify a user').setRequired(true))
		.addStringOption((option) => option.setName('amount').setDescription('Specify an amount').setRequired(true))
		.addStringOption((option) =>
			option
				.setName('target')
				.setDescription('Specify where the money is added.')
				.addChoices([
					['Wallet', 'wallet'],
					['Treasury', 'treasury'],
				])
				.setRequired(true)
		);

	execute = async (ctx: Context) => {
		const member = ctx.interaction.options.getMember('user') as GuildMember;
		const { currency } = ctx.guildDocument;
		const amount = ctx.interaction.options.getString('amount');
		const parsedAmount = parseString(amount);
		const target = ctx.interaction.options.getString('target');
		if (!parsedAmount) {
			return await ctx.embedify('error', 'user', `Invalid amount: \`${amount}\``);
		}

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			member.id,
			ctx.interaction.user.id,
			'ADD_MONEY',
			target === 'wallet' ? parsedAmount : 0,
			target === 'treasury' ? parsedAmount : 0,
			parsedAmount
		);

		return await ctx.embedify(
			'success',
			'user',
			`Added ${currency}${parseNumber(parsedAmount)} to <@!${member.user.id}>'s \`${target}\`.`
		);
	};
}
