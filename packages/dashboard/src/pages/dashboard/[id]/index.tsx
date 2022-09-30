import axios from 'axios';
import { APIGuild, RESTGetAPICurrentUserGuildsResult, RESTGetAPICurrentUserResult } from 'discord-api-types/v10';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ChannelNavBar } from 'packages/dashboard/src/components/misc/ChannelNavBar';
import { DashNavBar } from 'packages/dashboard/src/components/misc/DashNavBar';
import { GuildNavBar } from 'packages/dashboard/src/components/misc/GuildNavBar';

import { validateCookies } from '../../../lib/helpers';

type Props = {
	setup: boolean;
	guilds: RESTGetAPICurrentUserGuildsResult;
	user: RESTGetAPICurrentUserResult;
};

const HomePage: NextPage<Props> = ({ setup, guilds, user }) => {
	const router = useRouter();
	const guild = guilds.find((guild) => guild.id === router.query.id);
	return <>
		<div className='flex-1 flex h-screen overflow-hidden bg-discord-900'>
			<GuildNavBar guilds={guilds} user={user} />
			<ChannelNavBar guild={guilds.find((guild) => guild.id === router.query.id)} />
			<div className='flex-1 flex flex-col min-w-[40em]'>
				<DashNavBar guild={guilds.find((guild) => guild.id === router.query.id)} />
				<div className='flex-1 flex flex-col bg-discord-700 overflow-x-hidden no-scrollbar p-6'>
					<div className='bg-discord-600 w-full'>
						{setup
							? <>
								<h1 className="text-3xl font-semibold">
									Welcome to the {guild?.name} dashboard!
								</h1>
								<p className="text-xl">Select a channel to get started</p>
							</>
							: <>
								<p>Guild is not setup</p>;
							</>
						}
					</div>
				</div>
			</div>
		</div>
	</>;
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const headers = validateCookies(ctx);
	if (!headers) return { props: { guild: null, setup: false } };
	const { id } = ctx.query;
	const { data: botGuild } = await axios
		.get<APIGuild>(`http://localhost:3000/api/guilds/${id}`, { headers })
		.catch(() => ({ data: null }));
	const { data: guilds } = await axios
		.get<RESTGetAPICurrentUserGuildsResult>('http://localhost:3000/api/users/@me/guilds', { headers })
		.catch(() => ({ data: null }));
	const { data: user } = await axios
		.get<RESTGetAPICurrentUserResult>('http://localhost:3000/api/users/@me', { headers });
	if (!user) {
		return {
			redirect: { destination: '/api/auth', permanent: false },
			props: {},
		};
	}

	const setup = !!botGuild;
	const res = { props: { setup, guilds, user } as Props };
	return res;
}

export default HomePage;
