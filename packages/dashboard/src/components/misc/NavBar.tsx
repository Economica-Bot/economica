import { APIUser, RouteBases } from 'discord-api-types/v10';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { FC } from 'react';
import { FaBars, FaCode, FaCogs, FaDiscord } from 'react-icons/fa';

type Props = {
	user?: APIUser;
};

export const NavBar: FC<Props> = ({ user }) => {
	const router = useRouter();

	const handleLogin = () => {
		router.replace('http://localhost:3001/api/auth/discord');
	};
	const handleLogout = () => {
		router.replace('http://localhost:3001/api/auth/logout');
	};
	return (
		<nav
			className="bg-discord-900 font-thin shadow-drop p-3 fixed flex items-center justify-between w-full z-50 h-20 top-0"
			role="navigation"
		>
			<div
				className="mx-3 flex items-center justify-left cursor-pointer flex-grow"
				onClick={() => Router.push('/')}
			>
				<img
					src="/ecnmca-logo2.png"
					alt="Economica Navbar Logo"
					className="rotate"
					width={40}
				/>
				<h1 className="px-3 text-white text-3xl font-thin my-auto">
          Economica
				</h1>
			</div>

			<div className="md:hidden dropdown dropdown-end dropdown-hover mx-5">
				<label tabIndex={0} className="btn m-1 border-0">
					<FaBars size={25} />
				</label>
				<ul
					tabIndex={0}
					className="dropdown-content menu p-2 rounded-box w-52 bg-discord-900 shadow-drop"
				>
					<li className="hover:text-white font-semibold">
						<Link href="localhost:3001/api/invite">
							<a>Invite</a>
						</Link>
					</li>
					<li className="hover:text-white font-semibold">
						<Link href="/commands">
							<a>Commands</a>
						</Link>
					</li>
					<li className="hover:text-white font-semibold">
						<Link href="localhost:3001/api/support">
							<a>Support</a>
						</Link>
					</li>
				</ul>
			</div>

			<div className="hidden md:flex text-xl children:mx-3 children:flex children:items-center children:children:mx-1 children:text-discord-400 children:transition">
				<Link href='localhost:3001/api/invite'>
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
				<Link href='localhost:3001/api/support'>
					<a className="hover:text-white text-underline">
						<FaCogs size={25} />
						<h2>Support</h2>
					</a>
				</Link>
			</div>

			{(() => {
				if (user) {
					return (
						<div className="dropdown dropdown-end">
							<label tabIndex={0} className="btn btn-ghost btn-circle avatar">
								<div className="w-10 rounded-full">
									<img
										src={`${RouteBases.cdn}/avatars/${user.id}/${user.avatar}.png`}
										alt=""
									/>
								</div>
							</label>
							<ul
								tabIndex={0}
								className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-discord-900 rounded-box w-52"
							>
								<li>
									<Link href="/dashboard">
                    Dashboard
									</Link>
								</li>
								<li>
									<a onClick={handleLogout}>Logout</a>
								</li>
							</ul>
						</div>
					);
				}
				return (
					<button
						onClick={handleLogin}
						className="bg-blurple shadow-drop mr-4 rounded-lg flex items-center py-1 px-4 drop-shadow-lg transition duration-500 hover:shadow-2xl hover:scale-110"
					>
						<h5 className="text-white ">Login</h5>
					</button>
				);
			})()}
		</nav>
	);
};
