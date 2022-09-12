import axios from 'axios';
import {
	APIGuild,
	RESTAPIPartialCurrentUserGuild,
} from 'discord-api-types/v10';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { DashboardLayout } from '../../../components/layouts/dashboard';
import { useAppContext } from '../../../context/AppContext';
import { validateCookies } from '../../../lib/helpers';
import { NextPageWithLayout } from '../../../lib/types';

type Props = {
	setup: boolean;
};

const HomePage: NextPageWithLayout<Props> = ({ setup }) => {
	const [guild, setGuild] = useState<RESTAPIPartialCurrentUserGuild>();
	const { guilds } = useAppContext();
	const router = useRouter();
	useEffect(() => {
		const guildId = router.query.id;
		const guild = guilds.find((guild) => guild.id === guildId);
		setGuild(guild);
	}, []);
	return (
		<>
			{(() => {
				if (setup) {
					return (
						<>
							<h1 className="text-3xl font-semibold">
                Welcome to the {guild?.name} dashboard!
							</h1>
							<p className="text-xl">Select a channel to get started</p>
						</>
					);
				}
				return <p>Guild is not setup</p>;
			})()}
		</>
	);
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const headers = validateCookies(ctx);
	if (!headers) return { props: { guild: null, setup: false } };
	const { id } = ctx.query;
	const { data: botGuild } = await axios
		.get<APIGuild>(`http://localhost:3001/api/guilds/${id}`, {
		headers,
	})
		.catch(() => ({ data: null }));
	const setup = !!botGuild;
	const res = { props: { setup } as Props };
	return res;
}

HomePage.getLayout = function getLayout(page) {
	return <DashboardLayout>{page}</DashboardLayout>;
};

export default HomePage;
