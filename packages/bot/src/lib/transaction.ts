/* eslint-disable no-param-reassign */
import { parseNumber } from '@adrastopoulos/number-parser';
import { EmbedBuilder } from '@discordjs/builders';
import { Routes } from 'discord-api-types/v10';

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
		.setAuthor({ name: `Transaction | ${type}` })
		.setDescription(description)
		.addFields([
			{ name: '__**Wallet**__', value: `${guild.currency} \`${parseNumber(wallet)}\``, inline: true },
			{ name: '__**Treasury**__', value: `${guild.currency} \`${parseNumber(treasury)}\``, inline: true },
			{ name: '__**Total**__', value: `${guild.currency} \`${parseNumber(total)}\``, inline: true },
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
		const embed = displayTransaction(transactionEntity);
		await client.rest.post(Routes.channel(transactionLogId), { body: { embeds: [embed] } });
	}
}
