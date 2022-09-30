import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

type Props = {
	src: string;
	name: string;
	link: string;
};

export const DeveloperCard: FC<Props> = ({ src, name, link }) => (
	<div className="py-5 flex flex-col items-center" data-aos="fade-zoom-in">
		<div className="transition hover:scale-110 duration-500">
			<Image
				src={src}
				alt={src}
				className="rounded-full drop-shadow-md"
				width={100}
				height={100}
			/>
		</div>
		<Link href={link}>
			<a href={link}>
				<h4 className="font-thin text-underline mt-3 text-lg">{name}</h4>
			</a>
		</Link>
	</div>
);
