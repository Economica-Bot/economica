/* eslint-disable no-param-reassign */
import { parseNumber } from '@adrastopoulos/number-parser';
import { MessageEmbed, TextChannel } from 'discord.js';

import { Guild, Member, Transaction } from '../entities';
import { Economica } from '../structures/index.js';
import { TransactionString } from '../typings/index.js';

/**
 * Display a transaction
 * @param transaction - The transaction to display
 * @returns {MessageEmbed}
 */
export async function displayTransaction(transaction: Transaction): Promise<MessageEmbed> {
	const { id, guild, type, target, agent, wallet, treasury, createdAt } = transaction;
	const total = wallet + treasury;
	const description = `Target: <@!${target.user.id}> | Agent: <@!${agent.user.id}>`;
	return new MessageEmbed()
		.setColor('GOLD')
		.setAuthor({ name: `Transaction | ${type}` })
		.setDescription(description)
		.addFields([
			{ name: '__**Wallet**__', value: `${guild.currency}${parseNumber(wallet)}`, inline: true },
			{ name: '__**Treasury**__', value: `${guild.currency}${parseNumber(treasury)}`, inline: true },
			{ name: '__**Total**__', value: `${guild.currency}${parseNumber(total)}`, inline: true },
		])
		.setFooter({ text: `ID: ${id}` })
		.setTimestamp(createdAt);
}

/**
 * Record a transaction
 * @param {Client} client - Bot client.
 * @param {Guild} guild - The server.
 * @param {Member} target - The receiver of the transaction.
 * @param {Member} agent - The proponent of the transaction.
 * @param {TransactionString} type - The transaction type.
 * @param {number} wallet - The value to be added to the user's wallet.
 * @param {number} treasury - The value to be added to the user's treasury.
 * @returns {Promise<number>} total.
 */
export async function recordTransaction(
	client: Economica,
	guild: Guild,
	target: Member,
	agent: Member,
	type: TransactionString,
	wallet: number,
	treasury: number,
): Promise<void> {
	await client.connection.manager.update(Member, { id: target.id }, { wallet: target.wallet + wallet, treasury: target.treasury + treasury });
	const transactionEntity = await Transaction.create({ guild, target, agent, type, wallet, treasury }).save();
	const { transactionLogId } = guild;
	if (transactionLogId) {
		const channel = client.channels.cache.get(transactionLogId) as TextChannel;
		const member = channel.guild.members.cache.get(client.user.id);
		if (!channel.permissionsFor(member).has('SEND_MESSAGES') || !channel.permissionsFor(member).has('EMBED_LINKS')) return;
		const embed = await displayTransaction(transactionEntity);
		await channel.send({ embeds: [embed] });
	}
}
