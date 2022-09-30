import { APIUser, RouteBases } from 'discord-api-types/v10';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { FaBars, FaCode, FaCogs, FaDiscord } from 'react-icons/fa';

type Props = {
	user?: APIUser;
};

export const NavBar: FC<Props> = ({ user }) => (
	<nav
		className="bg-discord-900 font-thin shadow-drop p-3 fixed flex items-center justify-between w-full z-50 h-20 top-0"
		role="navigation"
	>
		<Link href='/'>
			<a className="mx-3 flex items-center justify-left cursor-pointer flex-grow">
				<div className='relative h-10 w-10'>
					<Image
						src="/ecnmca-logo2.png"
						alt="Economica Navbar Logo"
						className="rotate"
						layout='fill'
					/>
				</div>
				<h1 className="px-3 text-white text-3xl font-thin my-auto">
					Economica
				</h1>
			</a>
		</Link>

		<div className="md:hidden dropdown dropdown-end dropdown-hover mx-5">
			<label tabIndex={0} className="btn m-1 border-0">
				<FaBars size={25} />
			</label>
			<ul
				tabIndex={0}
				className="dropdown-content menu p-2 rounded-box w-52 bg-discord-900 shadow-drop"
			>
				<li className="hover:text-white font-semibold">
					<Link href="localhost:3000/api/invite">
						<a>Invite</a>
					</Link>
				</li>
				<li className="hover:text-white font-semibold">
					<Link href="/commands">
						<a>Commands</a>
					</Link>
				</li>
				<li className="hover:text-white font-semibold">
					<Link href="localhost:3000/api/support">
						<a>Support</a>
					</Link>
				</li>
			</ul>
		</div>

		<div className="hidden md:flex text-xl children:mx-3 children:flex children:items-center children:children:mx-1 children:text-discord-400 children:transition">
			<Link href='localhost:3000/api/invite'>
				<a className="hover:text-white text-underline">
					<FaDiscord size={25} />
					<h2>Invite</h2>
				</a>
			</Link>
			<Link href="/commands">
				<a className="hover:text-white text-underline">
					<FaCode size={25} />
					<h2>Commands</h2>
				</a>
			</Link>
			<Link href='localhost:3000/api/support'>
				<a className="hover:text-white text-underline">
					<FaCogs size={25} />
					<h2>Support</h2>
				</a>
			</Link>
		</div>

		{user
			? (
				<div className="dropdown dropdown-end">
					<label tabIndex={0} className="btn btn-ghost btn-circle avatar">
						<div className="w-10 rounded-full">
							<Image
								src={`${RouteBases.cdn}/avatars/${user.id}/${user.avatar}.png`}
								alt=""
								width={40}
								height={40}
							/>
						</div>
					</label>
					<ul
						tabIndex={0}
						className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-discord-900 rounded-box w-52"
					>
						<li>
							<Link href="/dashboard">
								<a>
									Dashboard
								</a>
							</Link>
						</li>
						<li>
							<Link href="http://localhost:3000/api/auth/discord">
								<a>Logout</a>
							</Link>
						</li>
					</ul>
				</div>
			) : (
				<Link href="http://localhost:3000/api/auth/logout">
					<a className="bg-blurple shadow-drop mr-4 rounded-lg flex items-center py-1 px-4 drop-shadow-lg transition duration-500 hover:shadow-2xl hover:scale-110 text-white">
						Login
					</a>
				</Link>
			)
		}
	</nav>
);
