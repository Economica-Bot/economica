import axios from 'axios';
import { RESTGetAPICurrentUserGuildsResult, RESTGetAPICurrentUserResult } from 'discord-api-types/v10';
import { GetServerSidePropsContext } from 'next';
import { useEffect } from 'react';

import { DashboardLayout } from '../../components/layouts/dashboard';
import { useAppContext } from '../../context/AppContext';
import { validateCookies } from '../../lib/helpers';
import { NextPageWithLayout } from '../../lib/types';

type Props = {
	guilds: RESTGetAPICurrentUserGuildsResult;
	user: RESTGetAPICurrentUserResult;
};

const DashboardPage: NextPageWithLayout<Props> = ({ guilds, user }) => {
	const { setGuilds, setUser } = useAppContext();
	useEffect(() => {
		setGuilds(guilds);
		setUser(user);
	}, []);

	return (
		<>
			<div className='bg-discord-600 w-10 h-10'>
				<h1>Hello, {user.username}</h1>
			</div>
		</>
	);
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const headers = validateCookies(ctx);
	if (!headers) return { props: { user: null } };
	const { data: guilds } = await axios
		.get<RESTGetAPICurrentUserGuildsResult>('http://localhost:3001/api/users/@me/guilds', { headers })
		.catch(() => ({ data: null }));
	const { data: user } = await axios
		.get<RESTGetAPICurrentUserResult>('http://localhost:3001/api/users/@me', { headers });
	if (!user) {
		return {
			redirect: { destination: '/api/auth', permanent: false },
			props: {},
		};
	}

	return { props: { guilds, user } as Props };
}

DashboardPage.getLayout = function getLayout(page) {
	return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;
