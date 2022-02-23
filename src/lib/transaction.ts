/* eslint-disable no-param-reassign */
import { MessageEmbed, TextChannel } from 'discord.js';

import { Guild, Member, Transaction, TransactionModel } from '../models/index.js';
import { Economica } from '../structures/index.js';
import { TransactionString } from '../typings/index.js';

export async function displayTransaction(transaction: Transaction): Promise<MessageEmbed> {
	await transaction.populate('target').populate('agent').populate('guild').execPopulate();
	const { target, guild, agent, wallet, treasury } = transaction;
	const total = wallet + treasury;
	const description = `Target: <@!${target.userId}> | Agent: <@!${agent.userId}>`;
	return new MessageEmbed()
		.setColor('GOLD')
		.setAuthor({ name: `Transaction | ${transaction.type}` })
		.setDescription(description)
		.addFields([
			{
				name: '__**Wallet**__',
				value: `${guild.currency}${wallet.toLocaleString()}`,
				inline: true,
			},
			{
				name: '__**Treasury**__',
				value: `${guild.currency}${treasury.toLocaleString()}`,
				inline: true,
			},
			{
				name: '__**Total**__',
				value: `${guild.currency}${total.toLocaleString()}`,
				inline: true,
			},
		])
		.setFooter({ text: `ID: ${transaction._id.toString()}` })
		.setTimestamp();
}

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
	client: Economica,
	guild: Guild,
	target: Member,
	agent: Member,
	type: TransactionString,
	wallet: number,
	treasury: number,
): Promise<void> {
	target.wallet += wallet;
	target.treasury += treasury;
	await target.save();
	const transactionDocument = await TransactionModel.create({ guild, target, agent, type, wallet, treasury });
	const { transactionLogId } = guild;
	if (transactionLogId) {
		const channel = client.channels.cache.get(transactionLogId) as TextChannel;
		const member = channel.guild.members.cache.get(client.user.id);
		if (!channel.permissionsFor(member).has('SEND_MESSAGES') || !channel.permissionsFor(member).has('EMBED_LINKS')) return;
		const embed = await displayTransaction(transactionDocument);
		await channel.send({ embeds: [embed] });
	}
}
