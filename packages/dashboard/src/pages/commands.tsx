import { Command } from '@economica/bot/src/structures';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { BaseLayout } from '../components/layouts/base';
import { NextPageWithLayout } from '../lib/types';

type Props = {
	commands: Array<Command>;
};

const CommandsPage: NextPageWithLayout<Props> = ({ commands }) => {
	const [currCommands, setCurrCommands] = useState(commands);

	const [query, setQuery] = useState('');
	const [modules, setModules] = useState(['ALL']);
	const [module, setModule] = useState('ALL');

	useEffect(() => {
		commands.forEach((command) => {
			if (!modules.find((module) => module === command.metadata.module)) modules.push(command.metadata.module);
			setModules(modules);
		});

		setCurrCommands(
			commands
				.filter(({ metadata }) => {
					if (
						query
						&& !metadata.name.toLowerCase().includes(query.toLowerCase())
						&& !metadata.description.toLowerCase().includes(query.toLowerCase())
					) return false;

					if (module !== 'ALL' && metadata.module !== module) return false;

					return true;
				})
				.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name)),
		);
	}, [module, query, commands]);

	return (
		<>
			<div className="mt-20 p-10 flex flex-col items-center min-h-screen">
				<h1 className="text-3xl font-bold m-3">Economica Commands</h1>
				<div className="w-full max-w-[50em] flex flex-col items-center">
					<input
						type="text"
						placeholder="Search"
						className="input input-ghost input-bordered w-full my-3"
						onChange={(e) => setQuery(e.target.value)}
					/>

					<div className="btn-group">
						{modules.map((m) => (
							<button
								key={m}
								className={`btn ${m.toUpperCase() === module ? 'btn-active btn-secondary' : ''}`}
								onClick={() => setModule(m.toUpperCase())}
							>
								{m}
							</button>
						))}
					</div>

					{currCommands.map(({ metadata }) => (
						<div
							key={metadata.name}
							tabIndex={0}
							className="collapse collapse-plus w-full bg-discord-900 m-2 rounded-xl"
						>
							<input type="checkbox" />
							<h1 className="collapse-title text-xl font-bold ">
								/{metadata.name}
								<span className="text-sm font-normal text-discord-500">
									{' '}
									- {metadata.description}
								</span>
							</h1>

							<div className="collapse-content">
								<div>
									<h2 className="text-base">Format:</h2>
									<p className="font-mono text-discord-500 p-3">
										/{metadata.format}
									</p>
								</div>
								<div>
									<h2>Examples:</h2>
									<ul className="font-mono text-discord-500 p-3">
										{metadata.examples
											? metadata.examples.map((example) => (
												<li key={example}>/{example}</li>
											))
											: 'None'}
									</ul>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export async function getStaticProps() {
	const { data: commands } = await axios
		.get('http://localhost:3001/api/commands')
		.catch(() => ({ data: null }));
	return { props: { commands } as Props };
}

CommandsPage.getLayout = (page) => <BaseLayout>{page}</BaseLayout>;

export default CommandsPage;
