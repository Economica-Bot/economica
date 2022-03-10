import { Loan } from '../entities/index.js';
import { recordTransaction } from '../lib/transaction.js';
import { Economica, Job } from '../structures/index.js';

export default class implements Job {
	public name = 'update-loans';
	public cooldown = 1000 * 60 * 5;
	public execute = async (client: Economica): Promise<void> => {
		const now = new Date();
		const loans = await Loan.find({ pending: false, active: true, complete: false });

		// Complete loan transaction.
		loans.forEach(async (loan) => {
			const { guild, borrower, lender, repayment } = loan;
			await recordTransaction(client, guild, borrower, lender, 'LOAN_GIVE_REPAYMENT', 0, -repayment);
			await recordTransaction(client, guild, borrower, lender, 'LOAN_RECEIVE_REPAYMENT', 0, repayment);
		});
		await Loan.update(
			{ pending: false, active: true, complete: false },
			{ active: false, complete: true },
		);
	};
}
