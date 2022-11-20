import { TransactionString } from '@economica/common';
import { EmbedBuilder } from 'discord.js';

import { trpc } from './trpc';

function parseNumber(number: number, decimals = 2) {
  let temp = number;
  let digits = 1;
  while (Math.abs(temp) >= 10) {
    temp /= 10;
    digits++;
  }

  switch (true) {
    default:
      return String(number);
    case digits < 4:
      return number.toFixed();
    case digits < 7:
      return (number / Math.pow(10, 3)).toFixed(decimals) + "k";
    case digits < 10:
      return (number / Math.pow(10, 6)).toFixed(decimals) + "m";
    case digits < 13:
      return (number / Math.pow(10, 9)).toFixed(decimals) + "g";
    case digits < 16:
      return (number / Math.pow(10, 12)).toFixed(decimals) + "t";
    case digits < 19:
      return (number / Math.pow(10, 15)).toFixed(decimals) + "p";
    case digits < 22:
      return (number / Math.pow(10, 18)).toFixed(decimals) + "e";
    case digits < 25:
      return (number / Math.pow(10, 21)).toFixed(decimals) + "z";
    case digits < 28:
      return (number / Math.pow(10, 24)).toFixed(decimals) + "y";
  }
}

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
