import { useRouter } from 'next/router';

import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { trpc } from '../../../lib/trpc';
import { NextPageWithLayout } from '../../_app';

const HomePage: NextPageWithLayout = () => {
	const router = useRouter();

	const { data, isLoading } = trpc.guild.byId.useQuery(
		router.query.id as string
	);

	if (isLoading) return <p>Loading...</p>;
	if (!data) return <p>Guild is not setup</p>;

	return (
		<div className="w-full">
			<h1 className="font-economica text-3xl">Overview</h1>
			<hr />
			<p>{JSON.stringify(data)}</p>
			<hr />
			<div>
				<div>
					<h2>New Messages</h2>
					<p>1000</p>
				</div>
				<div>
					<h2>Joins/Leaves</h2>
					<p>1000</p>
				</div>
				<div>
					<h2>Total Members</h2>
					<p>1000</p>
				</div>
			</div>
		</div>
	);
};

HomePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default HomePage;
