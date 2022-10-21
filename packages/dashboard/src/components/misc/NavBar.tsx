import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { FaBars, FaCode, FaCogs, FaDiscord } from 'react-icons/fa';
import { LoginAvatar } from './LoginAvatar';
import { ThemeSwitch } from './ThemeSwitch';

export const NavBar: FC = () => (
	<nav
		className='fixed top-0 z-50 inline-flex h-20 w-full justify-center bg-base-300 p-3 font-thin shadow-drop'
		role='navigation'
	>
		<div className='inline-flex max-w-screen-xl flex-grow items-center justify-between'>
			<Link href='/'>
				<a className='justify-left mx-3 flex flex-grow cursor-pointer items-center'>
					<div className='relative h-10 w-10'>
						<Image
							src='/economica.png'
							alt='Economica Navbar Logo'
							className='rotate'
							layout='fill'
						/>
					</div>
					<h1 className='my-auto px-3 text-3xl font-thin'>Economica</h1>
				</a>
			</Link>

			<div className='dropdown dropdown-end dropdown-hover mx-5 md:hidden'>
				<label tabIndex={0} className='btn m-1 border-0'>
					<FaBars size={25} />
				</label>
				<ul
					tabIndex={0}
					className='dropdown-content menu w-52 bg-base-300 p-2 shadow-drop'
				>
					<li className='font-semibold'>
						<Link href='localhost:3000/api/invite'>
							<a>Invite</a>
						</Link>
					</li>
					<li className='font-semibold'>
						<Link href='/commands'>
							<a>Commands</a>
						</Link>
					</li>
					<li className='font-semibold'>
						<Link href='localhost:3000/api/support'>
							<a>Support</a>
						</Link>
					</li>
				</ul>
			</div>

			<div className='inline-flex items-center gap-6'>
				<Link href='localhost:3000/api/invite'>
					<a className='inline-flex items-center gap-2 text-xl hover:underline'>
						<span>
							<FaDiscord size={25} />
						</span>
						<h2>Invite</h2>
					</a>
				</Link>
				<Link href='/commands'>
					<a className='inline-flex items-center gap-2 text-xl hover:underline'>
						<FaCode size={25} />
						<h2>Commands</h2>
					</a>
				</Link>
				<Link href='localhost:3000/api/support'>
					<a className='inline-flex items-center gap-2 text-xl hover:underline'>
						<FaCogs size={25} />
						<h2>Support</h2>
					</a>
				</Link>
				<LoginAvatar />
				<ThemeSwitch />
			</div>
		</div>
	</nav>
);
