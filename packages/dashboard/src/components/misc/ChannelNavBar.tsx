import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v10';
import { useRouter } from 'next/router';
import { FC } from 'react';

type Props = {
	guild?: RESTAPIPartialCurrentUserGuild;
};

export const ChannelNavBar: FC<Props> = ({ guild }) => {
	const router = useRouter();
	const handleLogout = async () => {
		window.location.href = 'http://localhost:3000/api/auth/logout';
	};
	return (
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
						<div>
							<h3
								className="hover:bg-discord-600 p-1 rounded-md cursor-pointer"
								onClick={() => router.push(`/dashboard/${guild?.id}/overview/currency`)
								}
							>
                # currency-symbol
							</h3>
							<h3
								className="hover:bg-discord-600 p-1 rounded-md cursor-pointer"
								onClick={() => router.push(`/dashboard/${guild?.id}/overview/logs`)
								}
							>
                # logs
							</h3>
							<h3
								className="hover:bg-discord-600 p-1 rounded-md cursor-pointer"
								onClick={() => router.push(`/dashboard/${guild?.id}/overview/moderation`)
								}
							>
                # moderation
							</h3>
							<h3
								className="hover:bg-discord-600 p-1 rounded-md cursor-pointer"
								onClick={() => router.push(`/dashboard/${guild?.id}/overview/economy`)
								}
							>
                # economy
							</h3>
						</div>
					</div>
				</div>
				<button
					className="bg-danger w-32 h-8 rounded-xl m-5 self-center"
					onClick={handleLogout}
				>
					<h1 className="font-pt_sans font-extrabold">Logout</h1>
				</button>
			</div>
		</div>
	);
};
