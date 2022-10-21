import { Infraction } from '@economica/bot/src/entities';
import { FC } from 'react';

import { UserCard } from './UserCard';

type Props = {
	infraction: Infraction;
};

export const InfractionBar: FC<Props> = ({ infraction }) => (
	<div
		key={infraction.id}
		className='mb-1 grid w-full grid-cols-5 gap-10 bg-base-300 py-3 px-6 font-expletus_sans'
	>
		<UserCard id={infraction.target.userId} />
		<h1>{infraction.type}</h1>
		<h1>{infraction.reason}</h1>
		<UserCard id={infraction.agent.userId} />
		<h1>{new Date(infraction.createdAt).toLocaleString()}</h1>
	</div>
);
