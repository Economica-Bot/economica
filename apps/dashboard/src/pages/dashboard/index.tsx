import { useSession } from 'next-auth/react';

import DashboardLayout from '../../components/layouts/DashboardLayout';
import { NextPageWithLayout } from '../_app';

const DashboardPage: NextPageWithLayout = () => {
	const { data } = useSession({ required: true });
	return (
		<div className="h-10 w-10 bg-base-100">
			<h1>Hello, {data?.user.username}</h1>
		</div>
	);
};

DashboardPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default DashboardPage;
