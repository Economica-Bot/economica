import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

type Props = {
	src: string;
	name: string;
	link: string;
};

export const DeveloperCard: FC<Props> = ({ src, name, link }) => (
	<div className="flex flex-col items-center py-5">
		<div className="relative h-32 w-32 transition duration-500 hover:scale-105">
			<Image
				src={src}
				alt={name}
				className="rounded-full drop-shadow-md"
				width={128}
				height={128}
			/>
		</div>
		<Link
			href={link}
			className="relative mt-3 text-lg font-thin before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-full before:origin-left before:scale-x-0 before:bg-base-content before:transition-all hover:before:scale-x-100"
		>
			{name}
		</Link>
	</div>
);
