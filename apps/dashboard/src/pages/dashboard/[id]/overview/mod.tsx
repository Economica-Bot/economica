import { useRouter } from 'next/router';
import { useState } from 'react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { InfractionBar } from '../../../../components/misc/InfractionBar';
import { trpc } from '../../../../lib/trpc';
import { NextPageWithLayout } from '../../../_app';

const ModerationPage: NextPageWithLayout = () => {
	const router = useRouter();
	const guildId = router.query.id as string;
	const limit = 15;
	const [page, setPage] = useState(1);
	const {
		data: count,
		isLoading: isLoading2,
		error: error2
	} = trpc.infraction.count.useQuery(guildId);
	const { data, isLoading, error } = trpc.infraction.list.useQuery({
		guildId,
		page,
		limit
	});

	if (isLoading || isLoading2) return <p>Loading...</p>;
	if (error || error2) return <p>Error</p>;

	return (
		<>
			<h1 className="mt-5 font-economica text-3xl">Infraction Log</h1>
			<div className="mt-5">
				<div className="inline-flex items-center gap-3">
					<button
						className={`btn btn-xs ${page === 1 ? 'btn-disabled' : ''}`}
						onClick={() => setPage(page - 1)}
					>
						Previous Page
					</button>
					<button
						className={`btn btn-xs ${
							page * limit >= count ? 'btn-disabled' : ''
						}`}
						onClick={() => setPage(page + 1)}
					>
						Next Page
					</button>
					<h1 className="font-mono">
						Infractions {(page - 1) * limit + 1}-{(page - 1) * limit + limit} of{' '}
						{count}
					</h1>
				</div>
				<div className="mt-3 grid grid-cols-5 gap-10 rounded-t-3xl bg-base-200 py-3 px-6">
					<h1 className="font-bold">Target</h1>
					<h1 className="font-bold">Type</h1>
					<h1 className="font-bold">Reason</h1>
					<h1 className="font-bold">Agent</h1>
					<h1 className="font-bold">Date</h1>
				</div>
				{data.map((infraction) => (
					<InfractionBar key={infraction.id} infraction={infraction} />
				))}
			</div>
		</>
	);
};

ModerationPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ModerationPage;
