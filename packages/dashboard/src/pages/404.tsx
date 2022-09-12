import { useRouter } from 'next/router';

import { BaseLayout } from '../components/layouts/base';
import { NextPageWithLayout } from '../lib/types';

const Custom404: NextPageWithLayout = () => {
	const router = useRouter();

	return (
		<>
			<div className="flex flex-col items-center justify-center min-h-screen">
				<h1 className="text-[10rem] font-bold">404</h1>
				<p className="text-3xl font-thin mb-5 ">
          This page could not be found!
				</p>
				<button
					onClick={() => router.push('/')}
					className="bg-blurple shadow-drop rounded-lg flex items-center py-1 px-4 drop-shadow-lg transition duration-500 hover:shadow-2xl hover:scale-110"
				>
					<h5>Home</h5>
				</button>
			</div>
		</>
	);
};

Custom404.getLayout = (page) => <BaseLayout>{page}</BaseLayout>;

export default Custom404;
