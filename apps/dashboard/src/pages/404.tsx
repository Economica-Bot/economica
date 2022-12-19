import Link from 'next/link';
import { ReactElement } from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { NextPageWithLayout } from './_app';

const Custom404: NextPageWithLayout = () => (
	<div className="flex min-h-screen flex-col items-center justify-center">
		<h1 className="text-[10rem] font-bold">404</h1>
		<p className="mb-5 text-3xl font-thin ">This page could not be found!</p>
		<Link href="/" className="btn-primary btn">
			Home
		</Link>
	</div>
);

Custom404.getLayout = function getLayout(page: ReactElement) {
	return <MainLayout>{page}</MainLayout>;
};

export default Custom404;
