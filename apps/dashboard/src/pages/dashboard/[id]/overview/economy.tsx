import { useEffect, useState } from 'react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { TransactionBar } from '../../../../components/misc/TransactionBar';
import { trpc } from '../../../../lib/trpc';
import { NextPageWithLayout } from '../../../_app';

import { ChannelType, RouteBases } from 'discord-api-types/v10';
import { useRouter } from 'next/router';
import { DashCard } from '../../../../components/misc/DashCard';
import { DashTitleField } from '../../../../components/misc/DashTitleField';

import Image from 'next/image';

const EconomyPage: NextPageWithLayout = () => {
	const router = useRouter();
	const guildId = router.query.id as string;
	const limit = 15;
	const [page, setPage] = useState(1);

	const mutation = trpc.guild.update.useMutation();

	const updateGuild = async () => {
		if (newGuild) {
			mutation.mutate(newGuild);
		}
	};

	const {
		data: transactions,
		isLoading: isLoading1,
		error: error1
	} = trpc.transaction.list.useQuery({
		guildId,
		page,
		limit
	});
	const {
		data: count,
		isLoading: isLoading2,
		error: error2
	} = trpc.transaction.count.useQuery(guildId);
	const {
		data: channels,
		isLoading: isLoading3,
		error: error3
	} = trpc.discord.guildChannels.useQuery(guildId);
	const {
		data: guild,
		isLoading: isLoading4,
		error: error4
	} = trpc.guild.byId.useQuery(guildId);
	const {
		data: roles,
		isLoading: isLoading5,
		error: error5
	} = trpc.discord.guildRoles.useQuery(guildId);
	const {
		data: emojis,
		isLoading: isLoading6,
		error: error6
	} = trpc.discord.guildEmojis.useQuery(guildId);

	const [newGuild, setNewGuild] = useState(guild);
	useEffect(() => {
		if (guild) setNewGuild(guild);
	}, [guild]);

	if (isLoading2 || isLoading3 || isLoading4 || isLoading5 || isLoading6)
		return <p>Loading...</p>;
	if (error2 || error3 || error4 || error5 || error6) return <p>Error</p>;

	return (
		<>
			<DashTitleField title="Economy" subtitle="View all things economy" />
			<div className="flex w-full">
				<DashCard
					title="Currency Symbol"
					subtitle="Set a prefix for all monetary affairs in the server"
				>
					<h3 className="text-md my-2 font-bold text-neutral-focus">
						Currency
					</h3>
					<div className="dropdown w-64">
						<label
							tabIndex={0}
							className="inline-flex w-full items-center justify-center rounded-lg bg-base-200 p-2 text-4xl"
						>
							{newGuild?.currency}
						</label>
						<ul className="dropdown-content mt-4 max-h-40 w-full overflow-auto rounded-md bg-base-200 p-2">
							{emojis.map((emoji, index) => (
								<li
									className="relative flex h-10 cursor-default select-none items-center justify-between rounded p-3 hover:bg-base-100"
									key={index}
									// onMouseDown={(e) =>
									// 	setNewGuild({ ...newGuild, currency: e.target.value })
									// }
								>
									<div className="relative h-10 w-10">
										<Image
											src={`${RouteBases.cdn}/emojis/${emoji.id}.png?size=32`}
											alt={emoji.name ?? ''}
											className="mask-square object-scale-down"
											fill
										/>
									</div>
									<span className="rounded bg-base-300 p-2 font-mono text-sm">
										{emoji.name}
									</span>
								</li>
							))}
						</ul>
					</div>
				</DashCard>
				<DashCard
					title="Transaction Logging"
					subtitle="Whenever a transaction occurs, Economica can send a message to a channel and optionally ping a role."
				>
					<div className="my-5">
						<h3 className="text-md my-2 font-bold text-neutral-focus">
							Transaction Channel
						</h3>
						<select
							className="select w-64"
							// onChange={(e) =>
							// 	setNewGuild({ ...newGuild, transactionLogId: e.target.value })
							// }
						>
							<option
								selected
								disabled
								value={newGuild?.transactionLogId ?? undefined}
							>
								{channels.find(
									(channel) => channel.id === newGuild?.transactionLogId
								)?.name ?? 'None'}
							</option>
							{channels
								.filter((channel) => channel.type === ChannelType.GuildText)
								.map((channel, index) => (
									<option key={index} value={channel.id}>
										{channel.name}
									</option>
								))}
						</select>
					</div>
					<div className="my-5">
						<h3 className="text-md my-2 font-bold text-neutral-focus">
							Role Ping <span className="badge">WIP</span>
						</h3>
						<select className="select-disabled select w-64">
							<option disabled selected>
								{guild.transactionLogId ?? 'None'}
							</option>
							{roles.map((role, index) => (
								<option key={index}>{role.name}</option>
							))}
						</select>
					</div>
				</DashCard>
			</div>
			<DashCard title="Transactions" subtitle="View all transactions">
				<div className="my-3 inline-flex items-center gap-3">
					<button
						className={`btn btn-secondary btn-xs ${
							page === 1 ? 'btn-disabled' : ''
						}`}
						onClick={() => setPage(page - 1)}
					>
						Previous Page
					</button>
					<button
						className={`btn btn-primary btn-xs ${
							page * limit >= count ? 'btn-disabled' : ''
						}`}
						onClick={() => setPage(page + 1)}
					>
						Next Page
					</button>
					<h1 className="font-mono">
						Transactions {(page - 1) * limit + 1}-{(page - 1) * limit + limit}{' '}
						of {count}
					</h1>
				</div>
				<table className="table w-full table-fixed">
					<thead>
						<tr>
							<th>Target</th>
							<th>Agent</th>
							<th>Type</th>
							<th>Wallet</th>
							<th>Treasury</th>
							<th>Date</th>
						</tr>
					</thead>
					<tbody>
						{!isLoading1 &&
							!error1 &&
							transactions.map((transaction) => (
								<TransactionBar
									key={transaction.id}
									transaction={transaction}
								/>
							))}
					</tbody>
				</table>
			</DashCard>
			{newGuild !== guild && (
				<div className="absolute bottom-10 left-1/2 z-40 flex w-5/6 -translate-x-1/2 items-center justify-between rounded-lg border-4 bg-base-300 p-4 text-xl shadow-lg">
					<h1 className="font-expletus_sans text-sm">
						Careful there! You have some unsaved changes. Save?
					</h1>
					<div className="inline-flex gap-3">
						<button
							className="btn btn-warning"
							onClick={() => setNewGuild(guild)}
						>
							Nay
						</button>
						<button className="btn btn-success" onClick={updateGuild}>
							Aye
						</button>
					</div>
				</div>
			)}
		</>
	);
};

EconomyPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EconomyPage;
