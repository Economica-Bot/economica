import { FilterQuery } from 'mongoose';

import * as util from '../lib/index.js';
import { Loan, LoanModel } from '../models/index.js';
import { Economica, Service } from '../structures/index.js';
import { SERVICE_COOLDOWNS } from '../typings/constants.js';

export default class implements Service {
	public service = 'update-loans';
	public cooldown = SERVICE_COOLDOWNS.UPDATE_LOANS;
	public execute = async (client: Economica): Promise<void> => {
		const now = new Date();
		const filter: FilterQuery<Loan> = { expires: { $lt: now }, pending: false, active: true, complete: false };
		const loanDocuments = await LoanModel.find(filter);
		if (loanDocuments?.length) {
			loanDocuments.forEach(async ({ guild, borrower, lender, repayment }) => {
				await util.transaction(client, guild, borrower, lender, 'LOAN_GIVE_REPAYMENT', 0, -repayment);
				await util.transaction(client, guild, borrower, lender, 'LOAN_RECEIVE_REPAYMENT', 0, repayment);
			});
			await LoanModel.updateMany(filter, { active: false, complete: true });
		}
	};
}
