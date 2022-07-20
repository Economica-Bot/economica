import { Loan } from '../entities';
import { recordTransaction } from '../lib';
import { Economica, Job } from '../structures';

export class LoansJob implements Job {
	public name = 'update-loans';

	public cooldown = 1000 * 60 * 5;

	public execute = async (client: Economica): Promise<void> => {
		const loans = await Loan.find({ where: { pending: false, active: true } });

		// Complete loan transaction.
		loans.forEach(async (loan) => {
			const { guild, borrower, lender, repayment } = loan;
			await recordTransaction(client, guild, borrower, lender, 'LOAN_RECEIVE_REPAYMENT', 0, repayment);
		});
		await Loan.update({ pending: false, active: true }, { active: false, completedAt: new Date() });
	};
}
