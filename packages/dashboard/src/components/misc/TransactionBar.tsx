import { Transaction } from '@economica/bot/src/entities';
import { FC } from 'react';

import { UserCard } from './UserCard';

type Props = {
	transaction: Transaction;
};

export const TransactionBar: FC<Props> = ({ transaction }) => (
	<div
		key={transaction.id}
		className="w-full py-3 px-6 grid gap-10 grid-cols-6 bg-discord-900 mb-1 font-expletus_sans"
	>
		<UserCard id={transaction.target.userId} />
		<UserCard id={transaction.agent.userId} />
		<h1 className='text-sm'>{transaction.type}</h1>
		<h1 className='text-lg font-bold'>{transaction.guild.currency} {transaction.wallet}</h1>
		<h1 className='text-lg font-bold'>{transaction.guild.currency} {transaction.treasury}</h1>
		<h1 className='text-sm'>{new Date(transaction?.createdAt).toLocaleString()}</h1>
	</div>
);
