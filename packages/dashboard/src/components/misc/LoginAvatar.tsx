import { RouteBases } from 'discord-api-types/v10';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSpinner } from 'react-icons/fa';

export const LoginAvatar: React.FC = () => {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return (
			<div className='animate-spin'>
				<FaSpinner className='h-5 w-5' />
			</div>
		);
	} else if (status === 'authenticated') {
		return (
			<div className='dropdown dropdown-end'>
				<label tabIndex={0} className='avatar btn btn-ghost btn-circle online'>
					<div className='h-10 w-10 rounded-full'>
						<Image
							src={`${RouteBases.cdn}/avatars/${session.user.id}/${session.user.avatar}.png`}
							alt=''
							layout='fill'
							className='rounded-full'
						/>
					</div>
				</label>

				<ul
					tabIndex={0}
					className='dropdown-content menu rounded-box mt-3 w-52 bg-base-300 p-2 shadow-3xl'
				>
					<li>
						<Link href='/dashboard'>
							<a>Dashboard</a>
						</Link>
					</li>
					<li>
						<button
							onClick={() => signOut({ redirect: false, callbackUrl: '/' })}
						>
							<a>Logout</a>
						</button>
					</li>
				</ul>
			</div>
		);
	} else
		return (
			<button
				onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
				className='btn btn-accent'
			>
				Login
			</button>
		);
};
