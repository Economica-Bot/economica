import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { trpc } from '../../../lib/trpc';
import { NextPageWithLayout } from '../../_app';

const HomePage: NextPageWithLayout = () => {
	const router = useRouter();

	const guildQuery = trpc.guild.byId.useQuery({
		id: router.query.id as string
	});
	const discordGuildQuery = trpc.discord.guild.useQuery(
		router.query.id as string
	);

	if (guildQuery.isLoading || discordGuildQuery.isLoading)
		return <p>Loading...</p>;
	if (!guildQuery.data || !discordGuildQuery.data)
		return <p>Guild is not setup</p>;

	return (
		<div className="w-full">
			<h1 className="font-economica text-3xl">Overview</h1>
			<pre className="m-3 rounded-md bg-base-300 p-5">
				{JSON.stringify(guildQuery.data, null, '\t')}
				{JSON.stringify(discordGuildQuery.data, null, '\t')}
			</pre>
		</div>
	);
};

HomePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default HomePage;
