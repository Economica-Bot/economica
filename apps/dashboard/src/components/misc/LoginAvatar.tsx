'use client';

import { RouteBases } from 'discord-api-types/v10';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSpinner } from 'react-icons/fa';

export const LoginAvatar: React.FC = () => {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return (
			<div className="animate-spin">
				<FaSpinner className="h-5 w-5" />
			</div>
		);
	} else if (status === 'authenticated') {
		return (
			<div className="dropdown-end dropdown">
				<label tabIndex={0} className="online btn btn-ghost btn-circle avatar">
					<div className="h-10 w-10 rounded-full">
						<Image
							src={`${RouteBases.cdn}/avatars/${session.user.id}/${session.user.avatar}.png`}
							alt=""
							className="rounded-full"
							fill
						/>
					</div>
				</label>

				<ul
					tabIndex={0}
					className="dropdown-content menu rounded-box mt-3 w-52 bg-base-300 p-2 shadow-3xl"
				>
					<li>
						<Link href="/dashboard">Dashboard</Link>
					</li>
					<li>
						<button
							onClick={() => signOut({ redirect: false, callbackUrl: '/' })}
						>
							Logout
						</button>
					</li>
				</ul>
			</div>
		);
	} else
		return (
			<button
				onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
				className="btn btn-accent"
			>
				Login
			</button>
		);
};
