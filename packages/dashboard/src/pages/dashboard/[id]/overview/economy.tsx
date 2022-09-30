import { Transaction } from '@economica/bot/src/entities';
import { GetServerSidePropsContext, NextPage } from 'next';

import { TransactionBar } from '../../../../components/misc/TransactionBar';
import { fetchTransactions } from '../../../../lib/api';

type Props = {
	transactions: Transaction[];
};

const ModerationPage: NextPage<Props> = ({ transactions }) => (
	<>
		<h1 className="text-3xl mt-5 font-economica">Transaction Log</h1>
		<div className='mt-5'>
			<div className="py-3 px-6 grid gap-10 grid-cols-6 bg-discord-800 rounded-t-3xl">
				<h1 className="font-bold">Target</h1>
				<h1 className="font-bold">Agent</h1>
				<h1 className="font-bold">Type</h1>
				<h1 className="font-bold">Wallet</h1>
				<h1 className="font-bold">Treasury</h1>
				<h1 className="font-bold">Date</h1>
			</div>
			{transactions.map((transaction) => <TransactionBar key={transaction.id} transaction={transaction} />)}
		</div>
	</>
);

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const transactions = await fetchTransactions(ctx);
	return { props: { transactions } as Props };
}

export default ModerationPage;
