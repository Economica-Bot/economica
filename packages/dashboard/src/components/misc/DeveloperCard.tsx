import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

type Props = {
	src: string;
	name: string;
	link: string;
};

export const DeveloperCard: FC<Props> = ({ src, name, link }) => (
	<div className='flex flex-col items-center py-5'>
		<div className='transition duration-500 hover:scale-110'>
			<Image
				src={src}
				alt={src}
				className='rounded-full drop-shadow-md'
				width={100}
				height={100}
			/>
		</div>
		<Link href={link}>
			<a href={link}>
				<h4 className='text-underline mt-3 text-lg font-thin'>{name}</h4>
			</a>
		</Link>
	</div>
);
