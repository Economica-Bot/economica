import { ReactElement, useState } from 'react';

import MainLayout from '../components/layouts/MainLayout';
import { CommandDropDown } from '../components/misc/CommandDropDown';
import { NextPageWithLayout } from './_app';
import { commandData } from '@economica/common';

const CommandsPage: NextPageWithLayout = () => {
	const [query, setQuery] = useState('');
	const [module, setModule] = useState('ALL');

	return (
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
					{commandData
						.filter(
							(command, index) =>
								commandData.findIndex(
									(command2) => command2.module === command.module
								) === index
						)
						.map((command) => (
							<button
								key={command.name}
								type="button"
								aria-current="page"
								className={`btn inline-block px-6 py-3 ${
									command.module.toUpperCase() === module ? 'btn-active' : ''
								}`}
								onClick={() => setModule(command.module.toUpperCase())}
							>
								{command.module}
							</button>
						))
						.concat(
							<button
								key="all"
								type="button"
								aria-current="page"
								className={`btn inline-block px-6 py-3 ${
									module === 'ALL' ? 'btn-active' : ''
								}`}
								onClick={() => setModule('ALL')}
							>
								ALL
							</button>
						)
						.reverse()}
				</div>

				{commandData
					.filter((command) => {
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
					.map((command) => (
						<CommandDropDown
							key={command.name}
							name={command.name}
							description={command.description}
							format={command.format}
							examples={command.examples}
						/>
					))}
			</div>
		</div>
	);
};

CommandsPage.getLayout = function getLayout(page: ReactElement) {
	return <MainLayout>{page}</MainLayout>;
};

export default CommandsPage;
