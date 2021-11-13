const loanSchema = require('@schemas/loan-sch');

module.exports = () => {
	const checkLoans = async () => {
		const now = new Date();

		const loans = await loanSchema.find({
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
					guildID,
					borrowerID,
					'loan',
					`Loan from <@!${lenderID}> \`repayed\` | Loan ID: \`${loan._id}\``,
					0,
					-repayment,
					-repayment
				);

				await util.transaction(
					guildID,
					lenderID,
					'loan',
					`Loan to <@!${borrowerID}> \`repayed\` | Loan ID: \`${loan._id}\``,
					0,
					repayment,
					repayment
				);
			}

			await loanSchema.updateMany(
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

		//Check every 5 seconds
		setTimeout(checkLoans, 1000 * 5);
	};

	checkLoans();
};
