import Image from 'next/image';
import { FC } from 'react';

type Props = {
	src: string;
	header: string;
	description: string;
	order: 'fade-left' | 'fade-right';
};

export const FeatureCard: FC<Props> = ({ src, header, description, order }) => (
	<div data-aos={order} className="card bg-discord-600 shadow-xl w-96 m-10">
		<figure className='relative h-96'>
			<Image
				src={src}
				alt=""
				layout='fill'
				className="rounded-xl shadow-3xl"
			/>
		</figure>
		<div className="card-body">
			<h2 className="card-title">
				<div className="badge badge-primary">New!</div>
				{header}
			</h2>
			<p>{description}</p>
		</div>
	</div>
);
