import { RESTGetAPICurrentUserResult } from 'discord-api-types/v10';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';

import { fetchUser } from '../../lib/api';

type Props = {
	id: string;
};

export const UserCard: FC<Props> = ({ id }) => {
	const [user, setUser] = useState<RESTGetAPICurrentUserResult>();
	useEffect(() => {
		fetchUser(id).then((user) => setUser(user));
	}, []);
	return (
		<div className="flex items-center">
			<Image
				src={user?.avatar}
				alt=""
				className="w-10 h-10 rounded-full mr-3"
				layout='fill'
			/>
			<div className="font-thin text-sm">
				<h1>{user?.username}</h1>
				<h2 className="font-mono">{user?.id}</h2>
			</div>
		</div>
	);
};
