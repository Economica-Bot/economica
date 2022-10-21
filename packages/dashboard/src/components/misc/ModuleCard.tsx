import { FC, ReactElement } from 'react';

type Props = {
	icon: ReactElement;
	title: string;
	description: string;
};

export const ModuleCard: FC<Props> = ({ icon, title, description }) => (
	<div className='my-4 flex h-[275px] w-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-8 bg-base-300 shadow-drop'>
		{icon}
		<h3 className='m-2 text-2xl'>{title}</h3>
		<h5 className='text-lg font-thin'>{description}</h5>
	</div>
);
