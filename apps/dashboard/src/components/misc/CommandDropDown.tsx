import { FC } from 'react';

type Props = {
	name: string;
	description: string;
	format?: string;
	examples?: string[];
};

export const CommandDropDown: FC<Props> = ({
	name,
	description,
	format,
	examples
}) => (
	<div className="collapse-arrow collapse m-2 w-full rounded-xl bg-base-300 p-3">
		<input type="checkbox" />
		<h1 className="collapse-title text-xl font-bold">
			/{name}
			<span className="text-sm font-normal"> - {description}</span>
		</h1>

		<div className="collapse-content">
			<div>
				<h2 className="mt-5 text-base">Format:</h2>
				<p className="p-3 font-mono">
					/{name} {format}
				</p>
			</div>
			<div>
				<h2>Examples:</h2>
				<ul className="p-3 font-mono">
					{examples
						? examples.map((example: string) => (
								<li key={example}>/{example}</li>
						  ))
						: 'None'}
				</ul>
			</div>
		</div>
	</div>
);
