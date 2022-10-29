'use client';

import { useEffect, useState } from 'react';
import { trpc } from '../../lib/trpc';
import { CommandDropDown } from './CommandDropDown';

// import { commandData } from '@economica/bot/src/lib/commandData';

async function CommandsPage() {
	const { data, status } = trpc.commands.useQuery();

	const [currCommands, setCurrCommands] = useState(data);
	const [query, setQuery] = useState('');
	const [modules, setModules] = useState(['ALL']);
	const [module, setModule] = useState('ALL');

	useEffect(() => {
		currCommands?.forEach((command) => {
			if (!modules.find((module) => module === command.module))
				modules.push(command.module);
			setModules(modules);
		});

		setCurrCommands(
			data
				?.filter((command) => {
					if (
						query &&
						!command.name.toLowerCase().includes(query.toLowerCase()) &&
						!command.description.toLowerCase().includes(query.toLowerCase())
					)
						return false;

					if (module !== 'ALL' && command.module !== module) return false;

					return true;
				})
				.sort((a, b) => a.name.localeCompare(b.name))
		);
	}, [module, query]);

	if (status === 'error') return <p>An error occurred</p>;
	if (status === 'loading') return <p>Loading...</p>;

	return (
		<>
			<div className="mt-20 flex min-h-screen w-full flex-col items-center p-10">
				<h1 className="m-3 text-3xl font-bold">Economica Commands</h1>
				<div className="flex w-full max-w-[50em] flex-col items-center">
					<input
						type="text"
						placeholder="Search"
						className="input-bordered input-ghost input my-3 w-full"
						onChange={(e) => setQuery(e.target.value)}
					/>

					<div className="btn-group">
						{modules.map((m, index) => (
							<button
								key={index}
								type="button"
								aria-current="page"
								className={`btn inline-block px-6 py-3 ${
									m.toUpperCase() === module ? 'btn-active' : ''
								}`}
								onClick={() => setModule(m.toUpperCase())}
							>
								{m}
							</button>
						))}
					</div>

					{currCommands?.map((command, index) => (
						<CommandDropDown
							key={index}
							name={command.name}
							description={command.description}
							format={command.format}
							examples={command.examples}
						/>
					))}
				</div>
			</div>
		</>
	);
}

export default CommandsPage;
