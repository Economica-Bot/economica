import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v10';
import Link from 'next/link';
import { FC } from 'react';

type Props = {
	guild?: RESTAPIPartialCurrentUserGuild;
};

export const ChannelNavBar: FC<Props> = ({ guild }) => (
	<div className="flex-none w-64 flex flex-col mt-5">
		<div className="flex-none h-16 px-5 bg-discord-800 border-b-2 border-discord-900 rounded-tl-3xl flex justify-center items-center">
			<h1 className="text-2xl font-bold">{guild?.name}</h1>
		</div>
		<div className="bg-discord-800 overflow-scroll no-scrollbar flex-1 flex flex-col">
			<div className="p-5 font-pt_sands flex-1">
				<div>
					<h1 className="font-extrabold text-sm mb-2 cursor-default">
						OVERVIEW
					</h1>
					<div className='flex flex-col'>
						<Link href={`/dashboard/${guild?.id}/overview/currency`}>
							<a className="hover:bg-discord-600 p-1 rounded-md cursor-pointer">
								# currency-symbol
							</a>
						</Link>
						<Link href={`/dashboard/${guild?.id}/overview/logs`}>
							<a className="hover:bg-discord-600 p-1 rounded-md cursor-pointer">
								# logs
							</a>
						</Link>
						<Link href={`/dashboard/${guild?.id}/overview/moderation`}>
							<a className="hover:bg-discord-600 p-1 rounded-md cursor-pointer">
								# moderation
							</a>
						</Link>
						<Link href={`/dashboard/${guild?.id}/overview/economy`}>
							<a className="hover:bg-discord-600 p-1 rounded-md cursor-pointer">
								# economy
							</a>
						</Link>
					</div>
				</div>
			</div>
			<div className='mx-auto my-5'>
				<Link href='http://localhost:3000/api/auth/logout'>
					<a className="btn btn-error">
						Logout
					</a>
				</Link>
			</div>
		</div>
	</div>
);
