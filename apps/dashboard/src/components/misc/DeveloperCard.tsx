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
		<div className="w-30 h-30 relative transition duration-500 hover:scale-110">
			<Image src={src} alt={src} className="rounded-full drop-shadow-md" fill />
		</div>
		<Link className="text-underline mt-3 text-lg font-thin" href={link}>
			{name}
		</Link>
	</div>
);
