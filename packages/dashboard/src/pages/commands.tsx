import axios from 'axios';
import { RESTGetAPICurrentUserResult } from 'discord-api-types/v10';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useEffect, useState } from 'react';

import { Footer } from '../components/misc/Footer';
import { NavBar } from '../components/misc/NavBar';
import { validateCookies } from '../lib/helpers';

type Props = {
	commands: any[],
	user: RESTGetAPICurrentUserResult,
};

const CommandsPage: NextPage<Props> = ({ commands, user }) => {
	const [currCommands, setCurrCommands] = useState(commands);

	const [query, setQuery] = useState('');
	const [modules, setModules] = useState(['ALL']);
	const [module, setModule] = useState('ALL');

	useEffect(() => {
		currCommands.forEach((command) => {
			if (!modules.find((module) => module === command.module)) modules.push(command.module);
			setModules(modules);
		});

		setCurrCommands(
			commands
				.filter((metadata) => {
					if (
						query
						&& !metadata.name.toLowerCase().includes(query.toLowerCase())
						&& !metadata.description.toLowerCase().includes(query.toLowerCase())
					) return false;

					if (module !== 'ALL' && metadata.module !== module) return false;

					return true;
				})
				.sort((a, b) => a.name.localeCompare(b.name)),
		);
	}, [module, query, currCommands]);

	return (
		<>
			<NavBar user={user} />
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

					{currCommands && currCommands.map((metadata) => (
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
			<Footer />
		</>
	);
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
	const headers = validateCookies(ctx);
	const res = await axios
		.get<RESTGetAPICurrentUserResult>('http://localhost:3000/api/users/@me', { headers })
		.catch(() => null);
	const { data: commands } = await axios
		.get('http://localhost:3000/api/commands');
	return { props: { commands, user: res ? res.data : null } as Props };
};

export default CommandsPage;
