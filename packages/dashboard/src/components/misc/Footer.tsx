import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

export const Footer: FC = () => (
	<footer className="bg-discord-900 bottom-0 z-50 flex flex-col items-center justify-center p-5 shadow-3xl">
		<Image
			src="/economica.png"
			alt="Economica Navbar Logo"
			className="rotate"
			width={40}
			height={40}
		/>
		<div className="my-5 flex flex-col sm:flex-row flex-wrap items-center justify-center font-semibold text-md children:m-3 children:text-xl">
			<Link href="localhost:3000/api/support">
				<a>
					<h5 className="text-underline">Support</h5>
				</a>
			</Link>
			<Link href="https://localhost:3000/api/support">
				<a>
					<h5 className="text-underline">Report A Bug</h5>
				</a>
			</Link>
			<Link href="/tos">
				<a>
					<h5 className="text-underline">Terms</h5>
				</a>
			</Link>
			<Link href="/privacy">
				<a>
					<h5 className="text-underline">Privacy Policy</h5>
				</a>
			</Link>
		</div>
		<h3 className="font-thin text-lg">Copyright Economica 2022</h3>
	</footer>
);
