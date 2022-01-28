import * as util from '../lib/util';
import { LoanModel } from '../models';
import { EconomicaClient, EconomicaService } from '../structures';

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
					const { guildId, borrowerId, lenderId, repayment } = loan;

					await util.transaction(
						client,
						guildId,
						borrowerId,
						lenderId,
						'LOAN_GIVE_REPAYMENT',
						0,
						-repayment,
						-repayment
					);

					await util.transaction(
						client,
						guildId,
						lenderId,
						borrowerId,
						'LOAN_RECEIVE_REPAYMENT',
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
