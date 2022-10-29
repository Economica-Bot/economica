import { parseNumber } from '@adrastopoulos/number-parser';
import { EmbedBuilder } from '@discordjs/builders';
import { TransactionString } from '@economica/api/src/types/interfaces';
import { trpc } from './trpc';

export const displayTransaction = async (transactionId: string) => {
	const transaction = await trpc.transaction.byId.query(transactionId);
	const total = transaction.wallet + transaction.treasury;
	const description = `Target: <@!${transaction.target.userId}> | Agent: <@!${transaction.agent.userId}>`;
	return new EmbedBuilder()
		.setAuthor({ name: `Transaction | ${transaction.type}` })
		.setDescription(description)
		.addFields([
			{
				name: '__**Wallet**__',
				value: `${transaction.guild.currency} \`${parseNumber(
					transaction.wallet
				)}\``,
				inline: true
			},
			{
				name: '__**Treasury**__',
				value: `${transaction.guild.currency} \`${parseNumber(
					transaction.treasury
				)}\``,
				inline: true
			},
			{
				name: '__**Total**__',
				value: `${transaction.guild.currency} \`${parseNumber(total)}\``,
				inline: true
			}
		])
		.setFooter({ text: `Id: ${transaction.id}` })
		.setTimestamp(transaction.createdAt);
};

export const recordTransaction = async (
	guildId: string,
	targetId: string,
	agentId: string,
	type: TransactionString,
	wallet: number,
	treasury: number
) => {
	const target = await trpc.member.byId.query({ userId: targetId, guildId });
	const guild = await trpc.guild.byId.query(guildId);
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
	const { transactionLogId } = guild;
	if (transactionLogId) {
		const embed = displayTransaction(transaction.id);
	}
};
