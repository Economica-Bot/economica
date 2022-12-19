import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { FaBars, FaCode, FaCogs, FaDiscord } from 'react-icons/fa';

import { LoginAvatar } from './LoginAvatar';
import { ThemeSwitch } from './ThemeSwitch';

export const NavBar: FC = () => (
	<nav
		className="fixed top-0 z-50 inline-flex h-20 w-full justify-center bg-base-300 p-3 font-thin shadow-drop"
		role="navigation"
	>
		<div className="inline-flex max-w-screen-xl grow items-center gap-2">
			<Link
				href="/"
				className="justify-left mx-3 flex grow cursor-pointer items-center"
			>
				<div className="relative h-10 w-10">
					<Image
						src="/economica.png"
						alt="Economica Navbar Logo"
						className="rotate object-scale-down"
						width={128}
						height={128}
					/>
				</div>
				<h1 className="my-auto hidden px-3 text-3xl font-thin md:block">
					Economica
				</h1>
			</Link>

			<div className="dropdown-end dropdown dropdown-hover mx-5 md:hidden">
				<label tabIndex={0} className="btn-ghost btn m-1 border-0">
					<FaBars size={25} />
				</label>
				<ul
					tabIndex={0}
					className="dropdown-content menu w-52 bg-base-300 p-2 shadow-drop"
				>
					<li className="font-semibold">
						<Link href="/api/invite">Invite</Link>
					</li>
					<li className="font-semibold">
						<Link href="/commands">Commands</Link>
					</li>
					<li className="font-semibold">
						<Link href="/api/support">Support</Link>
					</li>
					<li>
						<ThemeSwitch />
					</li>
				</ul>
			</div>

			<div className="hidden items-center gap-6 md:flex">
				<Link
					href="/api/invite"
					className="inline-flex items-center gap-2 text-xl hover:underline"
				>
					<span>
						<FaDiscord size={25} />
					</span>
					<h2>Invite</h2>
				</Link>
				<Link
					href="/commands"
					className="inline-flex items-center  gap-2 text-xl hover:underline"
				>
					<FaCode size={25} />
					<h2>Commands</h2>
				</Link>
				<Link
					href="/api/support"
					className="inline-flex items-center gap-2 text-xl hover:underline"
				>
					<FaCogs size={25} />
					<h2>Support</h2>
				</Link>
				<ThemeSwitch />
			</div>
			<LoginAvatar />
		</div>
	</nav>
);
