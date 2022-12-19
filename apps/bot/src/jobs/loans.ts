import { recordTransaction } from '../lib';
import cron from 'node-cron';
import { LoanStatus } from '@economica/common';
import { trpc } from '../lib/trpc';

export const LoanJob = cron.schedule('* * * * *', async () => {
	console.info('updating active loans');
	const loans = await trpc.loan.getActive.query();
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
			await trpc.loan.update.mutate({
				id: loan.id,
				status: LoanStatus.COMPLETE,
				completedAt: new Date()
			});
		});
});
