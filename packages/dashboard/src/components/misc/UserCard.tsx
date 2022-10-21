import { RouteBases } from 'discord-api-types/v10';
import Image from 'next/image';
import { FC } from 'react';
import { trpc } from '../../lib/trpc';

type Props = {
	id: string;
};

export const UserCard: FC<Props> = ({ id }) => {
	const { data, isLoading, error } = trpc.discord.user.useQuery(id);
	if (isLoading) return <p>Loading...</p>;
	if (error) return <p>An error ocurred</p>;
	return (
		<div className='relative flex flex-row items-center gap-3'>
			<div className='avatar'>
				<div className='relative w-10 rounded-full'>
					<Image
						src={`${RouteBases.cdn}/avatars/${data.id}/${data.avatar}.png`}
						alt='Profile'
						className='rounded-full object-contain'
						layout='fill'
					/>
				</div>
			</div>
			<div className='text-xs font-thin'>
				<h2>{data.username}</h2>
				<h3 className='font-mono'>{data.id}</h3>
			</div>
		</div>
	);
};
