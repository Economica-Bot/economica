import { FC, ReactElement } from 'react';

type Props = {
	icon: ReactElement;
	title: string;
	description: string;
};

export const ModuleCard: FC<Props> = ({ icon, title, description }) => (
	<div className="my-4 flex h-[275px] w-[300px] flex-col items-center justify-center rounded-2xl border-8 border-base-100 bg-base-300 shadow-drop transition-all hover:scale-110">
		{icon}
		<h3 className="m-2 text-2xl">{title}</h3>
		<h5 className="text-lg font-thin">{description}</h5>
	</div>
);
