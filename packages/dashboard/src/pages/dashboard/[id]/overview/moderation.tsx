import { GetServerSidePropsContext } from 'next';
import { DashboardLayout } from '../../../../components/layouts/dashboard';
import { InfractionBar } from '../../../../components/misc/InfractionBar';
import { fetchInfractions } from '../../../../lib/api';
import { Infraction, NextPageWithLayout } from '../../../../lib/types';

type Props = {
	infractions: Infraction[];
};

const ModerationPage: NextPageWithLayout<Props> = ({ infractions }) => (
	<>
		<h1 className="text-3xl mt-5 font-economica">Moderation Log</h1>
		<div className="mt-5">
			<div className="py-3 px-6 grid gap-10 grid-cols-5 bg-discord-800 rounded-t-3xl">
				<h1 className="font-bold">TARGET</h1>
				<h1 className="font-bold">TYPE</h1>
				<h1 className="font-bold">REASON</h1>
				<h1 className="font-bold">AGENT</h1>
				<h1 className="font-bold">DATE</h1>
			</div>
			{infractions.map((infraction) => <InfractionBar key={infraction.id} infraction={infraction} />)}
		</div>
	</>
);

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const infractions = await fetchInfractions(ctx);
	return { props: { infractions } as Props };
}

ModerationPage.getLayout = function (page) {
	return <DashboardLayout>{page}</DashboardLayout>;
};

export default ModerationPage;
