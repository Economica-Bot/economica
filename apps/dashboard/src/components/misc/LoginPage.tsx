import Link from 'next/link';
import { FC } from 'react';
import { FaDiscord, FaExclamationCircle } from 'react-icons/fa';

export const LoginPage: FC = () => (
	<div className="flex h-screen flex-col items-center justify-center">
		<div className="alert alert-info m-5 shadow-lg">
			<div>
				<FaExclamationCircle />
				<span className="font-bold">
					You must be logged in to view this page!
				</span>
			</div>
		</div>

		<div className="flex flex-1 items-center justify-center">
			<Link
				className="btn btn-primary gap-2"
				href="http://localhost:3000/api/auth/discord"
			>
				<FaDiscord size={30} />
				<h5>Login</h5>
			</Link>
		</div>
	</div>
);
