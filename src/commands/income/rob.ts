import { MessageEmbed } from 'discord.js';
import * as config from '../../../config.json';
import {
	Context,
	EconomicaCommand,
	EconomicaSlashCommandBuilder,
	TransactionTypes,
} from '../../structures';
import { getEconInfo, transaction } from '../../util/util';

export default class implements EconomicaCommand {
	data = new EconomicaSlashCommandBuilder()
		.setName('rob')
		.setDescription('Rob a user to earn a sum.')
		.setGroup('income')
		.setFormat('<user>')
		.setExamples(['rob @Wumpus'])
		.setGlobal(false)
		.addUserOption((option) =>
			option.setName('user').setDescription('Specify a user.').setRequired(true)
		);

	execute = async (ctx: Context) => {
		const target = ctx.interaction.options.getUser('user');
		const { wallet: targetWallet } = await getEconInfo(ctx.interaction.guildId, target.id);
		const amount = Math.ceil(Math.random() * targetWallet);
		const { chance, minfine, maxfine } = config.commands.rob;

		if (target.id === ctx.client.user.id) {
			return await ctx.interaction.reply(`You cannot rob ${ctx.client.user.username}`);
		}

		if (ctx.interaction.user.id === target.id) {
			return await ctx.interaction.reply('You cannot rob yourself');
		}

		if (targetWallet <= 0) {
			return await ctx.interaction.reply(`<@!${target.id}> has no money to steal!`);
		}

		if (Math.random() * 100 > chance) {
			const fine = Math.ceil(Math.random() * (maxfine - minfine) + minfine);
			await transaction(
				ctx.client,
				ctx.interaction.guildId,
				ctx.interaction.user.id,
				ctx.client.user.id,
				TransactionTypes.Rob_Fine,
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
			target.id,
			TransactionTypes.Rob_Success,
			amount,
			0,
			amount
		);

		await transaction(
			ctx.client,
			ctx.interaction.guildId,
			target.id,
			ctx.interaction.user.id,
			TransactionTypes.Rob_Victim,
			-amount,
			0,
			-amount
		);

		const embed = new MessageEmbed()
			.setColor('GOLD')
			.setAuthor({
				name: ctx.interaction.user.tag,
				iconURL: ctx.interaction.user.displayAvatarURL(),
			})
			.setDescription(
				`You Robbed ${target.username} and earned ${
					ctx.guildDocument.currency
				}${amount.toLocaleString()}`
			);

		await ctx.interaction.reply({ embeds: [embed] });
	};
}
