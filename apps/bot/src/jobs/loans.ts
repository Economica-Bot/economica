import { recordTransaction } from '../lib';
import cron from 'node-cron';
import { LoanStatus } from '@economica/common';
import { datasource, Loan, Not } from '@economica/db';

export const LoanJob = cron.schedule('* * * * *', async () => {
	console.info('updating active loans');
	const loans = await datasource.getRepository(Loan).find({
		where: { status: Not(LoanStatus.COMPLETE) }
	});
	loans
		.filter((loan) => loan.createdAt.getTime() + loan.duration < Date.now())
		.forEach(async (loan) => {
			const { guild, borrower, lender, repayment } = loan;
			await recordTransaction(
				guild.id,
				borrower.userId,
				lender.userId,
				'LOAN_RECEIVE_REPAYMENT',
				0,
				repayment
			);
			await datasource.getRepository(Loan).update(
				{
					id: loan.id
				},
				{
					status: LoanStatus.COMPLETE,
					completedAt: new Date()
				}
			);
		});
});
