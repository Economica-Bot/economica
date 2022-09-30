import axios from 'axios';
import { RESTGetAPICurrentUserGuildsResult, RESTGetAPICurrentUserResult } from 'discord-api-types/v10';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';

import { ChannelNavBar } from '../../components/misc/ChannelNavBar';
import { DashNavBar } from '../../components/misc/DashNavBar';
import { GuildNavBar } from '../../components/misc/GuildNavBar';
import { validateCookies } from '../../lib/helpers';

type Props = {
	guilds: RESTGetAPICurrentUserGuildsResult;
	user: RESTGetAPICurrentUserResult;
};

const DashboardPage: NextPage<Props> = ({ guilds, user }) => {
	const router = useRouter();

	return <>
		<div className='flex-1 flex h-screen overflow-hidden bg-discord-900'>
			<GuildNavBar guilds={guilds} user={user} />
			<ChannelNavBar guild={guilds.find((guild) => guild.id === router.query.id)} />
			<div className='flex-1 flex flex-col min-w-[40em]'>
				<DashNavBar guild={guilds.find((guild) => guild.id === router.query.id)} />
				<div className='flex-1 flex flex-col bg-discord-700 overflow-x-hidden no-scrollbar p-6'>
					<div className='bg-discord-600 w-10 h-10'>
						<h1>Hello, {user.username}</h1>
					</div>
				</div>
			</div>
		</div>
	</>;
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const headers = validateCookies(ctx);
	if (!headers) return { props: { user: null } };
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

	return { props: { guilds, user } as Props };
}

export default DashboardPage;
