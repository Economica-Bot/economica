import { MessageEmbed, TextChannel } from 'discord.js';

import { Guild, Member, Transaction, TransactionModel } from '../models';
import { Context, EconomicaClient } from '../structures';
import { TransactionString } from '../typings';

/**
 * Record a transaction
 * @param {Context} ctx - Command context.
 * @param {Member} target - The receiver of the transaction.
 * @param {Member} agent - The proponent of the transaction.
 * @param {TransactionString} type - The transaction type.
 * @param {number} wallet - The value to be added to the user's wallet.
 * @param {number} treasury - The value to be added to the user's treasury.
 * @returns {Promise<number>} total.
 */
export async function transaction(
	client: EconomicaClient,
	guild: Guild,
	target: Member,
	agent: Member,
	type: TransactionString,
	wallet: number,
	treasury: number
): Promise<void> {
	target.wallet += wallet;
	target.treasury += treasury;
	await target.save();

	const transaction_ = {
		guild,
		target,
		agent,
		type,
		wallet,
		treasury,
	} as Transaction;

	const transaction = await (await TransactionModel.create(transaction_)).save();
	const { transactionLogChannelId } = guild;
	if (transactionLogChannelId) {
		const channel = client.channels.cache.get(transactionLogChannelId) as TextChannel;
		const guild = channel.guild;
		const member = guild.members.cache.get(client.user.id);
		if (!channel.permissionsFor(member).has('SEND_MESSAGES') || !channel.permissionsFor(member).has('EMBED_LINKS')) {
			return;
		}

		const embed = await displayTransaction(transaction);
		await channel.send({ embeds: [embed] }).catch((err) => {
			throw new Error(err);
		});
	}
}

export async function displayTransaction(transaction: Transaction): Promise<MessageEmbed> {
	const target = (await transaction.populate('target').execPopulate()).target as Member;
	const agent = (await transaction.populate('agent').execPopulate()).agent as Member;
	const guild = (await transaction.populate('guild').execPopulate()).guild as Guild;
	const cSymbol = guild.currency;
	const wallet = transaction.wallet;
	const treasury = transaction.treasury;
	const total = wallet + treasury;
	const description = `Target: <@!${target.userId}>	|	Agent: <@!${agent.userId}>`;
	return new MessageEmbed()
		.setColor('GOLD')
		.setAuthor({ name: `Transaction | ${transaction.type}` })
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
		.setFooter({ text: `ID: ${transaction._id.toString()}` })
		.setTimestamp();
}
