import { FC } from 'react';
import { FaDiscord, FaExclamationCircle } from 'react-icons/fa';

export const LoginPage: FC = () => {
	const handleLogin = () => {
		window.location.href = 'http://localhost:3001/api/auth/discord';
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<div className="alert alert-info shadow-lg m-5">
				<div>
					<FaExclamationCircle />
					<span className='font-bold'>You must be logged in to view this page!</span>
				</div>
			</div>

			<div className="flex-1 flex items-center justify-center">
				<button onClick={handleLogin} className="btn btn-primary gap-2">
					<FaDiscord size={30} />
					<h5 className="text-white ">Login</h5>
				</button>
			</div>
		</div>
	);
};
