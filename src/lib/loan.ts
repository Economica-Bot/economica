import { parseNumber } from '@adrastopoulos/number-parser';
import { EmbedBuilder } from 'discord.js';
import ms from 'ms';

import { Loan } from '../entities';
import { Emojis } from '../typings';

export function displayLoan(loan: Loan) {
	const embed = new EmbedBuilder()
		.setAuthor({ name: `Loan ${loan.id}` })
		.setDescription(`**Created At**: \`${loan.createdAt.toLocaleString()}\`\n**Completed At**: \`${loan.completedAt?.toLocaleString() || 'N/A'}\``)
		.addFields([
			{ name: '🤵‍♂️ Lender', value: `<@!${loan.lender.userId}>`, inline: true },
			{ name: `${Emojis.PERSON_ADD} Borrower`, value: `<@!${loan.borrower?.userId}>`, inline: true },
			{ name: `${Emojis.DEED} Message`, value: `*${loan.message}*` },
			{ name: `${Emojis.ECON_DOLLAR} Principal`, value: `${loan.guild.currency}${parseNumber(loan.principal)}`, inline: true },
			{ name: `${Emojis.CREDIT} Repayment`, value: `${loan.guild.currency}${parseNumber(loan.repayment)}`, inline: true },
			{ name: `${Emojis.TIME} Duration`, value: `\`${ms(loan.duration, { long: true })}\``, inline: true },
		])
		.setTimestamp(loan.createdAt);

	return embed;
}
