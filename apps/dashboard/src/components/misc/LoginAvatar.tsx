import { RouteBases } from 'discord-api-types/v10';
import Image from 'next/image';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { FaSpinner } from 'react-icons/fa';

export const LoginAvatar: React.FC = () => {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return <FaSpinner className="h-5 w-5 animate-spin" />;
	}

	if (status === 'authenticated') {
		return (
			<div className="dropdown-end dropdown">
				<label tabIndex={0} className="online btn-ghost btn-circle avatar btn">
					<div className="h-10 w-10 rounded-full">
						<Image
							src={`${RouteBases.cdn}/avatars/${session.user.id}/${session.user.avatar}.png`}
							alt=""
							className="rounded-full"
							width={128}
							height={128}
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
	}

	return (
		<button
			onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
			className="btn-accent btn"
		>
			Login
		</button>
	);
};
