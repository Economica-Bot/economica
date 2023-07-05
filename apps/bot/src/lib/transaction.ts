import { TransactionString } from '@economica/common';
import { datasource, Guild, Member, Transaction, User } from '@economica/db';
import { EmbedBuilder } from 'discord.js';
import { client } from '..';
import { parseNumber } from './economy';

export const recordTransaction = async (
	guildId: string,
	targetId: string,
	agentId: string,
	type: TransactionString,
	wallet: number,
	treasury: number
) => {
	await datasource
		.getRepository(User)
		.upsert({ id: targetId }, { conflictPaths: ['id'] });
	const target = await datasource
		.getRepository(Member)
		.findOneByOrFail({ userId: targetId, guildId });
	const guildEntity = await datasource
		.getRepository(Guild)
		.findOneByOrFail({ id: guildId });
	await datasource.getRepository(Member).update(
		{
			userId: targetId,
			guildId
		},
		{
			wallet: target.wallet + wallet,
			treasury: target.treasury + treasury
		}
	);
	const transaction = datasource.getRepository(Transaction).create({
		guild: { id: guildId },
		target: { userId: targetId, guildId },
		agent: { userId: agentId, guildId },
		type,
		wallet,
		treasury
	});
	await datasource.manager.save(transaction);
	if (!guildEntity.transactionLogId) return;
	const channel = await client.channels.fetch(guildEntity.transactionLogId);
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
			.setTimestamp(transaction.createdAt);
		channel.send({ embeds: [embed] });
	}
};
