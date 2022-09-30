import Link from 'next/link';
import { FC } from 'react';
import { FaDiscord, FaExclamationCircle } from 'react-icons/fa';

export const LoginPage: FC = () => (
	<div className="flex flex-col items-center justify-center h-screen">
		<div className="alert alert-info shadow-lg m-5">
			<div>
				<FaExclamationCircle />
				<span className='font-bold'>You must be logged in to view this page!</span>
			</div>
		</div>

		<div className="flex-1 flex items-center justify-center">
			<Link href="http://localhost:3000/api/auth/discord">
				<a className='btn btn-primary gap-2'>
					<FaDiscord size={30} />
					<h5 className="text-white ">Login</h5>
				</a>
			</Link>
		</div>
	</div>
);
