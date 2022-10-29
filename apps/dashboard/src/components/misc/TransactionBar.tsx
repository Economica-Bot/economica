import { Transaction } from '@economica/bot/src/entities';
import { FC } from 'react';

import { UserCard } from './UserCard';

type Props = {
	transaction: Transaction;
};

export const TransactionBar: FC<Props> = ({ transaction }) => (
	<tr className="children:overflow-hidden">
		<th>
			<UserCard id={transaction.target.userId} />
		</th>
		<th>
			<UserCard id={transaction.agent.userId} />
		</th>
		<th className="font-mono text-xs">{transaction.type}</th>
		<th className="font-economica">
			{transaction.guild.currency} {transaction.wallet.toLocaleString()}
		</th>
		<th className="font-economica">
			{transaction.guild.currency} {transaction.treasury.toLocaleString()}
		</th>
		<th className="whitespace-pre-wrap text-sm font-thin">
			{new Date(transaction.createdAt).toLocaleString()}
		</th>
	</tr>
);
