/* eslint-disable no-param-reassign */
import { parseNumber } from '@adrastopoulos/number-parser';
import { EmbedBuilder, PermissionFlagsBits, resolveColor, TextChannel } from 'discord.js';

import { Guild, Member, Transaction } from '../entities';
import { Economica } from '../structures';
import { TransactionString } from '../typings';

/**
 * Display a transaction
 * @param transaction - The transaction to display
 * @returns {EmbedBuilder}
 */
export function displayTransaction(transaction: Transaction): EmbedBuilder {
	const { id, guild, type, target, agent, wallet, treasury, createdAt } = transaction;
	const total = wallet + treasury;
	const description = `Target: <@!${target.userId}> | Agent: <@!${agent.userId}>`;
	return new EmbedBuilder()
		.setColor(resolveColor('Gold'))
		.setAuthor({ name: `Transaction | ${type}` })
		.setDescription(description)
		.addFields([
			{ name: '__**Wallet**__', value: `${guild.currency}${parseNumber(wallet)}`, inline: true },
			{ name: '__**Treasury**__', value: `${guild.currency}${parseNumber(treasury)}`, inline: true },
			{ name: '__**Total**__', value: `${guild.currency}${parseNumber(total)}`, inline: true },
		])
		.setFooter({ text: `Id: ${id}` })
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
	target.wallet += wallet;
	target.treasury += treasury;
	await target.save();
	const transactionEntity = await Transaction.create({ guild, target, agent, type, wallet, treasury }).save();
	const { transactionLogId } = guild;
	if (transactionLogId) {
		const channel = client.channels.cache.get(transactionLogId) as TextChannel;
		const member = channel.guild.members.cache.get(client.user.id);
		if (!channel.permissionsFor(member).has(PermissionFlagsBits.SendMessages) || !channel.permissionsFor(member).has(PermissionFlagsBits.EmbedLinks)) return;
		const embed = displayTransaction(transactionEntity);
		await channel.send({ embeds: [embed] });
	}
}
