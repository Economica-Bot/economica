import { EconomicaClient, EconomicaService, TransactionTypes } from '../structures';
import { LoanModel } from '../models';
import * as util from '../util/util';

export default class implements EconomicaService {
	name = 'update-loan';
	execute = async (client: EconomicaClient) => {
		setInterval(async () => {
			console.log(`Executing service ${this.name}`);
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
						TransactionTypes.Loan,
						`Loan from <@!${lenderID}> \`repayed\` | Loan ID: \`${loan._id}\``,
						0,
						-repayment,
						-repayment
					);

					await util.transaction(
						client,
						guildID,
						lenderID,
						TransactionTypes.Loan,
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
	};
}
