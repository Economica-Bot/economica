import { Transaction } from '@economica/db';
import { FC } from 'react';
import { Emoji } from './Emoji';

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
			<div className="inline-flex items-center gap-2">
				<span className="inline-block h-6 w-6">
					<Emoji text={transaction.guild.currency} />{' '}
				</span>
				<code>{transaction.wallet.toLocaleString()}</code>
			</div>
		</th>
		<th className="font-economica">
			<div className="inline-flex items-center gap-2">
				<span className="inline-block h-6 w-6">
					<Emoji text={transaction.guild.currency} />{' '}
				</span>
				<code>{transaction.treasury.toLocaleString()}</code>
			</div>
		</th>
		<th className="whitespace-pre-wrap text-sm font-thin">
			{new Date(transaction.createdAt).toLocaleString()}
		</th>
	</tr>
);
