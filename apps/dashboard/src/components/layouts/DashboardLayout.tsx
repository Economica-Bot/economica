import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { FC, PropsWithChildren } from 'react';

import { ChannelNavBar } from '../misc/ChannelNavBar';
import { DashNavBar } from '../misc/DashNavBar';
import { GuildNavBar } from '../misc/GuildNavBar';
import { LoadingSkeleton } from '../misc/LoadingSkeleton';
import { trpc } from '../../lib/trpc';

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
	const router = useRouter();
	const { data, status } = useSession({ required: true });
	const guildQuery = trpc.discord.userGuilds.useQuery(data?.accessToken || '', {
		enabled: !!data && status === 'authenticated'
	});

	if (status === 'loading' || guildQuery.status === 'loading')
		return <LoadingSkeleton />;
	if (guildQuery.status === 'error') return <p>An error ocurred :(</p>;

	return (
		<>
			<div className="absolute top-0 left-0 flex h-full min-w-full bg-base-300">
				<GuildNavBar guilds={guildQuery.data} user={data.user} />
				<ChannelNavBar
					guild={guildQuery.data.find((guild) => guild.id === router.query.id)}
					user={data.user}
				/>
				<div className="relative flex min-w-[56em] flex-1 flex-col">
					<DashNavBar
						guild={guildQuery.data.find(
							(guild) => guild.id === router.query.id
						)}
					/>
					<div className="no-scrollbar flex flex-1 flex-col overflow-x-scroll bg-base-100 p-6">
						{children}
					</div>
				</div>
			</div>
		</>
	);
};

export default DashboardLayout;
