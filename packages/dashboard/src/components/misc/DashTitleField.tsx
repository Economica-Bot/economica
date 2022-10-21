type Props = {
	title: string;
	subtitle: string;
};

export const DashTitleField: React.FC<Props> = ({ title, subtitle }) => (
	<div className='my-5'>
		<h1 className='my-3 text-4xl'>{title}</h1>
		<h2 className='font-thin text-neutral-focus'>{subtitle}</h2>
	</div>
);
