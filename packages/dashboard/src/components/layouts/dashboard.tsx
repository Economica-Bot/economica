import { useRouter } from 'next/router';
import { ReactElement } from 'react';

import { useAppContext } from '../../context/AppContext';
import { ChannelNavBar } from '../misc/ChannelNavBar';
import { DashNavBar } from '../misc/DashNavBar';
import { GuildNavBar } from '../misc/GuildNavBar';

export function DashboardLayout({ children }: { children: ReactElement }) {
	const router = useRouter();

	const { guilds, user } = useAppContext();

	return (
		<div className="flex-1 flex h-screen overflow-hidden bg-discord-900">
			{
				user
					? <GuildNavBar guilds={guilds} user={user} />
					: null
			}
			<ChannelNavBar
				guild={guilds?.find((guild) => guild.id === router.query.id)}
			/>
			<div className=" flex-1 flex flex-col min-w-[40em]">
				<DashNavBar
					guild={guilds?.find((guild) => guild.id === router.query.id)}
				/>
				<div className="flex-1 flex flex-col bg-discord-700 overflow-x-hidden no-scrollbar p-6">
					{children}
				</div>
			</div>
		</div>
	);
}
