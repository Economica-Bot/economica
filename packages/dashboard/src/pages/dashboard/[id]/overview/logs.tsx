import axios from 'axios';
import { APIGuildTextChannel, ChannelType } from 'discord-api-types/v10';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardLayout } from '../../../../components/layouts/dashboard';
import { NextPageWithLayout } from '../../../../lib/types';

type Props = {
	channels: APIGuildTextChannel<ChannelType.GuildText>[];
};

const LogsPage: NextPageWithLayout<Props> = ({ channels }) => {
	const router = useRouter();
	const guildId = router.query.id;

	const [currTransactionLog, setCurrTransactionLog] = useState('');
	const [newTransactionLog, setNewTransactionLog] = useState('');

	const [currInfractionLog, setCurrInfractionLog] = useState('');
	const [newInfractionLog, setNewInfractionLog] = useState('');

	const getTransactionLog = async () => {
		const {
			data: { transactionLogId },
		} = await axios.get(
			`http://localhost:3001/api/guilds/${guildId}/transaction_log`,
		);
		setCurrTransactionLog(transactionLogId);
	};

	const changeTransactionLogId = async () => {
		await axios.put(
			`http://localhost:3001/api/guilds/${guildId}/transaction_log`,
			{ transactionLogId: newTransactionLog },
		);
		toast.success('Transaction Log Updated');
		getTransactionLog();
	};

	const resetTransactionLog = async () => {
		await axios.put(
			`http://localhost:3001/api/guilds/${guildId}/transaction_log/reset`,
		);
		toast.warn('Transaction Log Reset');
		getTransactionLog();
	};

	const getInfractionLog = async () => {
		const {
			data: { infractionLogId },
		} = await axios.get(
			`http://localhost:3001/api/guilds/${guildId}/infraction_log`,
		);
		setCurrInfractionLog(infractionLogId);
	};

	const changeInfractionLogId = async () => {
		await axios.put(
			`http://localhost:3001/api/guilds/${guildId}/infraction_log`,
			{ infractionLogId: newInfractionLog },
		);
		toast.success('Infraction Log Updated');
		getInfractionLog();
	};

	const resetInfractionLog = async () => {
		await axios.put(
			`http://localhost:3001/api/guilds/${guildId}/infraction_log/reset`,
		);
		toast.warn('Infraction Log Reset');
		getInfractionLog();
	};

	useEffect(() => {
		getTransactionLog();
		getInfractionLog();
	}, []);

	return (
		<>
			<h1 className="text-lg font-expletus_sans">Transaction Log</h1>
			<div className="w-full bg-discord-900 mt-5 py-3 px-6 rounded-full flex items-center justify-between">
				<div className="form-control w-full max-w-xs">
					<select
						className="select select-bordered"
						onChange={(e) => setNewTransactionLog(e.target.value)}
					>
						{
							!currTransactionLog
								? <option selected disabled>
									None
								</option>
								: null
						}
						{
							channels.map((channel) => (
								<option
									key={channel.id}
									value={channel.id}
									selected={channel.id === currTransactionLog}
									disabled={channel.id === currTransactionLog}
								>
									#{channel.name}
								</option>
							))}
					</select>
				</div>
				<div>
					<button
						className="btn btn-success mr-5"
						onClick={changeTransactionLogId}
					>
						Save
					</button>
					<button className="btn btn-error" onClick={resetTransactionLog}>
						Reset
					</button>
				</div>
			</div>
			<h1 className="text-lg font-expletus_sans mt-5">Infraction Log</h1>
			<div className="w-full bg-discord-900 mt-5 py-3 px-6 rounded-full flex items-center justify-between">
				<div className="form-control w-full max-w-xs">
					<select
						className="select select-bordered"
						onChange={(e) => setNewInfractionLog(e.target.value)}
					>
						{
							!currInfractionLog
								? <option selected disabled>
									None
								</option>
								: null
						}
						{
							channels.map((channel) => (
								<option
									key={channel.id}
									value={channel.id}
									selected={channel.id === currInfractionLog}
									disabled={channel.id === currInfractionLog}
								>
									#{channel.name}
								</option>
							))
						}
					</select>
				</div>
				<div>
					<button
						className="btn btn-success mr-5"
						onClick={changeInfractionLogId}
					>
						Save
					</button>
					<button className="btn btn-error" onClick={resetInfractionLog}>
						Reset
					</button>
				</div>
			</div>
		</>
	);
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	const { data: channels } = await axios.get(
		`http://localhost:3001/api/guilds/${ctx.params!.id}/channels`,
	);
	const res = { props: { channels } as Props };
	return res;
}

LogsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default LogsPage;