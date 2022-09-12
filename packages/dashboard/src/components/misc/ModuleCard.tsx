import { FC, ReactElement } from 'react';

type Props = {
	icon: ReactElement;
	title: string;
	description: string;
};

export const ModuleCard: FC<Props> = ({ icon, title, description }) => (
	<div className="bg-discord-900 rounded-2xl w-[300px] h-[275px] drop-shadow-lg my-4 flex flex-col items-center justify-center cursor-pointer hover:border-[6px] border-discord-600 hover:bg-discord-700 shadow-drop" data-aos-easing='ease-out-back' data-aos='fade-up'>
		{icon}
		<h3 className='m-2 text-2xl'>{title}</h3>
		<h5 className="font-thin text-lg">{description}</h5>
	</div>
);
