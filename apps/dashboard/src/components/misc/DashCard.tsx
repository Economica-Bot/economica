import { PropsWithChildren } from 'react';

type Props = PropsWithChildren & {
	title: string;
	subtitle: string;
};

export const DashCard: React.FC<Props> = ({ title, subtitle, children }) => (
	<div className="m-3 flex-1 rounded-lg bg-base-300 p-5">
		<h1 className="my-2 text-2xl">{title}</h1>
		<h2 className="text-sm text-neutral-focus">{subtitle}</h2>
		<hr className="my-3" />
		{children}
	</div>
);
