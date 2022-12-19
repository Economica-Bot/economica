import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

export const Footer: FC = () => (
	<footer className="z-50 flex w-full flex-col items-center gap-5 bg-base-300 p-5 shadow-3xl">
		<div className="relative h-10 w-10">
			<Image
				src="/economica.png"
				alt="Economica Navbar Logo"
				className="rotate"
				width={128}
				height={128}
			/>
		</div>
		<div className="text-md children:m-3 children:text-xl flex flex-col flex-wrap items-center justify-center gap-3 font-semibold sm:flex-row">
			<Link href="/api/support">
				<h5 className="text-underline">Support</h5>
			</Link>
			<Link href="/api/support">
				<h5 className="text-underline">Report A Bug</h5>
			</Link>
			<Link href="/tos">
				<h5 className="text-underline">Terms</h5>
			</Link>
			<Link href="/privacy">
				<h5 className="text-underline">Privacy Policy</h5>
			</Link>
		</div>
		<h3 className="text-lg font-thin">Copyright Economica 2022</h3>
	</footer>
);
