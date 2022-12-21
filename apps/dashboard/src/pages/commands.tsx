import { ReactElement, useState } from 'react';

import { CommandData, ModuleStringArr } from '@economica/common';
import { NextPageWithLayout } from './_app';
import { CommandAccordionItem } from '../components/misc/CommandAccordionItem';
import MainLayout from '../components/layouts/MainLayout';

const CommandsPage: NextPageWithLayout = () => {
	const [query, setQuery] = useState('');
	const [module, setModule] = useState('ALL');

	return (
		<div className="mt-20 flex min-h-screen w-full flex-col items-center gap-5 p-10">
			<h1 className="text-3xl font-bold">Economica Commands</h1>
			<div className="max-md:input-group md:w-full">
				<input
					type="text"
					placeholder="Search"
					className="input-bordered input w-1/2 md:w-full"
					onChange={(e) => setQuery(e.target.value)}
				/>
				<select
					className="select-bordered select w-1/2 md:hidden"
					onChange={(e) => setModule(e.target.value)}
				>
					{['ALL'].concat(ModuleStringArr).map((m) => (
						<option key={m}>{m}</option>
					))}
				</select>
			</div>
			<div className="flex w-full max-w-4xl gap-3">
				<div className="btn-group btn-group-vertical hidden md:flex">
					{['ALL'].concat(ModuleStringArr).map((m) => (
						<button
							key={m}
							type="button"
							aria-current="page"
							className={`btn inline-block px-6 py-3 ${
								m === module ? 'btn-active' : 'btn-secondary'
							}`}
							onClick={() => setModule(m)}
						>
							{m}
						</button>
					))}
				</div>
				<div className="flex w-full flex-col gap-4">
					{CommandData.filter(
						(command) =>
							(command.module === module || module === 'ALL') &&
							(query.length
								? command.name.toLowerCase().includes(query.toLowerCase()) ||
								  command.description
										.toLowerCase()
										.includes(query.toLowerCase())
								: true)
					)
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((command) => (
							<CommandAccordionItem
								key={command.name}
								name={command.name}
								description={command.description}
								format={command.format}
								examples={command.examples}
							/>
						))}
				</div>
			</div>
		</div>
	);
};

CommandsPage.getLayout = function getLayout(page: ReactElement) {
	return <MainLayout>{page}</MainLayout>;
};

export default CommandsPage;
