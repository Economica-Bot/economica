import { NextPage } from 'next';
import Link from 'next/link';

const Custom404: NextPage = () => (
	<>
		<div className='flex min-h-screen flex-col items-center justify-center'>
			<h1 className='text-[10rem] font-bold'>404</h1>
			<p className='mb-5 text-3xl font-thin '>This page could not be found!</p>
			<Link href='/'>
				<a className='btn btn-primary'>Home</a>
			</Link>
		</div>
	</>
);

export default Custom404;
