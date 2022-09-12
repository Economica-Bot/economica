import { FC, useEffect, useState } from 'react';
import { fetchUser } from '../../lib/api';
import { User } from '../../lib/types';

type Props = {
	id: string;
};

export const UserCard: FC<Props> = ({ id }) => {
	const [user, setUser] = useState<User>();
	useEffect(() => {
		fetchUser(id).then((user) => setUser(user));
	}, []);
	return (
		<div className="flex items-center">
			<img
				src={user?.displayAvatarURL}
				alt=""
				className="w-10 h-10 rounded-full mr-3"
			/>
			<div className="font-thin text-sm">
				<h1>{user?.tag}</h1>
				<h2 className="font-mono">{user?.id}</h2>
			</div>
		</div>
	);
};
