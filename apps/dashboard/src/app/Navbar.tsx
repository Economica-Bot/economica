'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { FaBars, FaCode, FaCogs, FaDiscord } from 'react-icons/fa';
import { LoginAvatar } from './LoginAvatar';
import { ThemeSwitch } from './ThemeSwitch';

export const Navbar: FC = () => (
	<nav
		className="fixed top-0 z-50 inline-flex h-20 w-full justify-center bg-base-300 p-3 font-thin shadow-drop"
		role="navigation"
	>
		<div className="inline-flex max-w-screen-xl flex-grow items-center justify-between">
			<Link
				className="justify-left mx-3 flex flex-grow cursor-pointer items-center"
				href="/"
			>
				<div className="relative h-10 w-10">
					<Image
						src="/economica.png"
						alt="Economica Navbar Logo"
						className="rotate"
						fill
					/>
				</div>
				<h1 className="my-auto px-3 text-3xl font-thin">Economica</h1>
			</Link>

			<div className="dropdown-end dropdown dropdown-hover mx-5 md:hidden">
				<label tabIndex={0} className="btn m-1 border-0">
					<FaBars size={25} />
				</label>
				<ul
					tabIndex={0}
					className="dropdown-content menu w-52 bg-base-300 p-2 shadow-drop"
				>
					<li className="font-semibold">
						<Link href="localhost:3000/api/invite">Invite</Link>
					</li>
					<li className="font-semibold">
						<Link href="/commands">Commands</Link>
					</li>
					<li className="font-semibold">
						<Link href="localhost:3000/api/support">Support</Link>
					</li>
				</ul>
			</div>

			<div className="inline-flex items-center gap-6">
				<Link
					className="inline-flex items-center gap-2 text-xl hover:underline"
					href="localhost:3000/api/invite"
				>
					<span>
						<FaDiscord size={25} />
					</span>
					<h2>Invite</h2>
				</Link>
				<Link
					className="inline-flex items-center gap-2 text-xl hover:underline"
					href="/commands"
				>
					<FaCode size={25} />
					<h2>Commands</h2>
				</Link>
				<Link
					className="inline-flex items-center gap-2 text-xl hover:underline"
					href="localhost:3000/api/support"
				>
					<FaCogs size={25} />
					<h2>Support</h2>
				</Link>
				<LoginAvatar />
				<ThemeSwitch />
			</div>
		</div>
	</nav>
);
