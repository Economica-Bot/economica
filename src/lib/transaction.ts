import { MessageEmbed, TextChannel } from 'discord.js';

import { getEconInfo } from '.';
import { GuildModel, MemberModel, TransactionModel } from '../models';
import { EconomicaClient } from '../structures';
import { TransactionString } from '../typings';

/**
 * Record a transaction
 * @param {EconomicaClient} client - Economica Client.
 * @param {string} guildId - Guild id.
 * @param {string} userId - User id.
 * @param {TransactionString} type - The transaction type.
 * @param {number} wallet - The value to be added to the user's wallet.
 * @param {number} treasury - The value to be added to the user's treasury.
 * @param {number} total - The value to be added to the user's total.
 * @returns {Promise<number>} total.
 */
export async function transaction(
	client: EconomicaClient,
	guildId: string,
	userId: string,
	agentId: string,
	type: TransactionString,
	wallet: number,
	treasury: number,
	total: number
): Promise<number> {
	//Init
	await getEconInfo(guildId, userId);
	const result = await MemberModel.findOneAndUpdate(
		{
			guildId,
			userId,
		},
		{
			$inc: {
				wallet,
				treasury,
				total,
			},
		}
	);

	const transaction = await TransactionModel.create({
		guildId,
		userId,
		agentId,
		type,
		wallet,
		treasury,
		total,
	});

	const guildSetting = await GuildModel.findOne({ guildId });
	const { transactionLogChannelId } = guildSetting;

	if (transactionLogChannelId) {
		const cSymbol = guildSetting.currency;
		const channel = client.channels.cache.get(transactionLogChannelId) as TextChannel;
		const guild = channel.guild;
		const member = guild.members.cache.get(client.user.id);
		if (!channel.permissionsFor(member).has('SEND_MESSAGES') || !channel.permissionsFor(member).has('EMBED_LINKS')) {
			return;
		}

		const description = `Transaction for <@!${userId}>\nPerformed by:<@!${agentId}>\nType: \`${type}\``;
		const embed = new MessageEmbed()
			.setColor('GOLD')
			.setAuthor({ name: transaction._id.toString(), iconURL: guild.iconURL() })
			.setDescription(description)
			.addFields([
				{
					name: '__**Wallet**__',
					value: `${cSymbol}${wallet.toLocaleString()}`,
					inline: true,
				},
				{
					name: '__**Treasury**__',
					value: `${cSymbol}${treasury.toLocaleString()}`,
					inline: true,
				},
				{
					name: '__**Total**__',
					value: `${cSymbol}${total.toLocaleString()}`,
					inline: true,
				},
			])
			.setTimestamp();

		channel.send({
			embeds: [embed],
		});
	}

	return result.total;
}
