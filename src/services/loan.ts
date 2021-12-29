import { Client } from 'discord.js';
import { LoanModel } from '../models/index';
import * as util from '../util';

export const name = 'loan';

export async function execute(client: Client) {
	setInterval(async () => {
		const now = new Date();

		const loans = await LoanModel.find({
			expires: {
				$lt: now,
			},
			pending: false,
			active: true,
			complete: false,
		});

		//Complete loan transaction.
		if (loans && loans.length) {
			for (const loan of loans) {
				const { guildID, borrowerID, lenderID, repayment } = loan;

				await util.transaction(
					client,
					guildID,
					borrowerID,
					'loan',
					`Loan from <@!${lenderID}> \`repayed\` | Loan ID: \`${loan._id}\``,
					0,
					-repayment,
					-repayment
				);

				await util.transaction(
					client,
					guildID,
					lenderID,
					'loan',
					`Loan to <@!${borrowerID}> \`repayed\` | Loan ID: \`${loan._id}\``,
					0,
					repayment,
					repayment
				);
			}

			await LoanModel.updateMany(
				{
					expires: {
						$lt: now,
					},
					pending: false,
					active: true,
					complete: false,
				},
				{
					active: false,
					complete: true,
				}
			);
		}
	}, 1000 * 5);
}
