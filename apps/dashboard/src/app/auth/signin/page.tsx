import { NextPage } from 'next';
import Link from 'next/link';

import { signIn } from 'next-auth/react';

const SignIn: NextPage = () => (
	<>
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h1 className="text-6xl font-bold">How&apos;d you get here?</h1>
			<p className="mt-4 text-3xl font-thin ">
				You must be logged in to view this page!
			</p>
			<button
				onClick={() =>
					signIn('discord', {
						callbackUrl:
							new URLSearchParams(window.location.search).get('callbackUrl') ??
							window.location.origin
					})
				}
				className="btn-primary btn mt-10"
			>
				Login with Discord
			</button>
			<Link className="btn-secondary btn mt-3" href="/">
				Home
			</Link>
		</div>
	</>
);

export default SignIn;
