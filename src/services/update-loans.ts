import { SERVICE_COOLDOWNS } from '../config';
import * as util from '../lib';
import { Guild, LoanModel, Member } from '../models';
import { Context, EconomicaClient, EconomicaService } from '../structures';

export default class implements EconomicaService {
	public name = 'update-loans';
	public cooldown = SERVICE_COOLDOWNS.UPDATE_LOANS;
	public execute = async (client: EconomicaClient): Promise<void> => {
		const now = new Date();
		const loanDocuments = await LoanModel.find({
			expires: {
				$lt: now,
			},
			pending: false,
			active: true,
			complete: false,
		});

		//Complete loan transaction.
		if (loanDocuments?.length) {
			for (const loanDocument of loanDocuments) {
				const {
					guild,
					borrower,
					lender,
					repayment,
				}: { guild: Guild; borrower: Member; lender: Member; repayment: number } = loanDocument;
				const ctx = new Context(client);

				await util.transaction(ctx.client, ctx.guildDocument, borrower, lender, 'LOAN_GIVE_REPAYMENT', 0, -repayment);
				await util.transaction(ctx.client, ctx.guildDocument, borrower, lender, 'LOAN_RECEIVE_REPAYMENT', 0, repayment);
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
	};
}
