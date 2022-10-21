import { useQuery } from '@tanstack/react-query';
import { RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FC, PropsWithChildren } from 'react';
import { ChannelNavBar } from '../misc/ChannelNavBar';
import { DashNavBar } from '../misc/DashNavBar';
import { GuildNavBar } from '../misc/GuildNavBar';
import { LoadingSkeleton } from '../misc/LoadingSkeleton';

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
	const router = useRouter();
	const { data, status } = useSession({ required: true });
	const { data: guilds } = useQuery<RESTGetAPICurrentUserGuildsResult>(
		['guilds'],
		() => fetch('/api/discord/current-guilds').then((res) => res.json())
	);

	if (!guilds || status === 'loading') return <LoadingSkeleton />;

	return (
		<>
			<div className='absolute top-0 left-0 flex h-full min-w-full bg-base-300'>
				<GuildNavBar guilds={guilds} user={data.user} />
				<ChannelNavBar
					guild={guilds.find((guild) => guild.id === router.query.id)}
					user={data.user}
				/>
				<div className='relative flex min-w-[56em] flex-1 flex-col'>
					<DashNavBar
						guild={guilds.find((guild) => guild.id === router.query.id)}
					/>
					<div className='no-scrollbar flex flex-1 flex-col overflow-x-scroll bg-base-100 p-6'>
						{children}
					</div>
				</div>
			</div>
		</>
	);
};

export default DashboardLayout;
