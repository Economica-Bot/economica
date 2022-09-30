import { NextPage } from 'next';
import Link from 'next/link';

const Custom404: NextPage = () => <>
	<div className="flex flex-col items-center justify-center min-h-screen">
		<h1 className="text-[10rem] font-bold">404</h1>
		<p className="text-3xl font-thin mb-5 ">
			This page could not be found!
		</p>
		<Link href="/">
			<a className="bg-blurple shadow-drop rounded-lg flex items-center py-1 px-4 drop-shadow-lg transition duration-500 hover:shadow-2xl hover:scale-110">
				Home
			</a>
		</Link>
	</div>
</>;

export default Custom404;
