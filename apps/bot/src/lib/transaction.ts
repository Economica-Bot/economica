import { TransactionString } from '@economica/common';
import { EmbedBuilder } from 'discord.js';
import { client } from '..';
import { parseNumber } from './economy';

import { trpc } from './trpc';

export const recordTransaction = async (
	guildId: string,
	targetId: string,
	agentId: string,
	type: TransactionString,
	wallet: number,
	treasury: number
) => {
	const target = await trpc.member.byId.query({ userId: targetId, guildId });
	const guildEntity = await trpc.guild.byId.query({ id: guildId });
	await trpc.member.update.mutate({
		userId: targetId,
		guildId,
		wallet: target.wallet + wallet,
		treasury: target.treasury + treasury
	});
	const transaction = await trpc.transaction.create.mutate({
		guild: { id: guildId },
		target: { userId: targetId, guildId },
		agent: { userId: agentId, guildId },
		type,
		wallet,
		treasury
	});
	const { transactionLogId } = guildEntity;
	if (transactionLogId) {
		const channel = await client.channels.fetch(transactionLogId);
		if (channel && channel.isTextBased()) {
			const total = transaction.wallet + transaction.treasury;
			const description = `Target: <@!${transaction.target.userId}> | Agent: <@!${transaction.agent.userId}>`;
			const embed = new EmbedBuilder()
				.setAuthor({ name: `Transaction | ${transaction.type}` })
				.setDescription(description)
				.addFields([
					{
						name: '__**Wallet**__',
						value: `${guildEntity.currency} \`${parseNumber(
							transaction.wallet
						)}\``,
						inline: true
					},
					{
						name: '__**Treasury**__',
						value: `${guildEntity.currency} \`${parseNumber(
							transaction.treasury
						)}\``,
						inline: true
					},
					{
						name: '__**Total**__',
						value: `${guildEntity.currency} \`${parseNumber(total)}\``,
						inline: true
					}
				])
				.setFooter({ text: `Id: ${transaction.id}` })
				.setTimestamp(new Date(transaction.createdAt));
			channel.send({ embeds: [embed] });
		}
	}
};
