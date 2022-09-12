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
			<img
				src={src}
				alt={src}
				width={125}
				className="rounded-full shadow-[0px_0px_17px_2px_#45464c]"
			/>
		</div>
		<Link href={link}>
			<a href={link}>
				<h4 className="font-thin text-underline mt-3 text-lg">{name}</h4>
			</a>
		</Link>
	</div>
);
