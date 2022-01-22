import { parse_number, parse_string } from '@adrastopoulos/number-parser';
import { GuildMember, MessageEmbed } from 'discord.js';
import {
	Context,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	PermissionRole,
	TransactionTypes,
} from '../../structures';
import { transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('add-money')
		.setDescription('Add/remove funds from a balance.')
		.setGroup('economy')
		.setFormat('<user> <amount> <target>')
		.setExamples(['add-money @JohnDoe 300 wallet', 'add-money @Wumpus 100 treasury'])
		.setRoles([new PermissionRole('ECONOMY MANAGER', true)])
		.setGlobal(false)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('amount').setDescription('Specify an amount').setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('target')
				.setDescription('Specify where the money is added.')
				.addChoices([
					['wallet', 'wallet'],
					['treasury', 'treasury'],
				])
				.setRequired(true)
		);

	execute = async (ctx: Context) => {
		const member = ctx.interaction.options.getMember('user') as GuildMember;
		const { currency } = ctx.guildDocument;
		const amount = parse_string(ctx.interaction.options.getString('amount'));
		const target = ctx.interaction.options.getString('target');
		if (!amount) return await ctx.interaction.reply(`Invalid amount: \`${amount}\``);
		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			member.id,
			ctx.interaction.user.id,
			TransactionTypes.Add_Money,
			target === 'wallet' ? amount : 0,
			target === 'treasury' ? amount : 0,
			amount
		);

		const embed = new MessageEmbed()
			.setColor('GREEN')
			.setAuthor({ name: member.user.username, url: member.user.displayAvatarURL() })
			.setDescription(
				`Added ${currency}${parse_number(amount)} to <@!${member.user.id}>'s \`${target}\`.`
			);

		return await ctx.interaction.reply({ embeds: [embed] });
	};
}
