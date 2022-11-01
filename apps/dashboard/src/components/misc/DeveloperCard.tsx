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
		<div className="relative h-32 w-32 transition duration-500 hover:scale-110">
			<Image
				src={src}
				alt={src}
				className="rounded-full drop-shadow-md"
				width={128}
				height={128}
			/>
		</div>
		<Link href={link} className="text-underline mt-3 text-lg font-thin">
			{name}
		</Link>
	</div>
);
