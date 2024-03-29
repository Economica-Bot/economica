import { DefaultCurrencySymbol } from '@economica/common';
import { Guild } from '@economica/db';
import {
	RESTGetAPICurrentUserGuildsResult,
	RESTGetAPICurrentUserResult
} from 'discord-api-types/v10';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { trpc } from '../../../../lib/trpc';
import { NextPageWithLayout } from '../../../_app';

type Props = {
	guilds: RESTGetAPICurrentUserGuildsResult;
	user: RESTGetAPICurrentUserResult;
};

const CurrencyPage: NextPageWithLayout<Props> = () => {
	const router = useRouter();
	const guildId = router.query.id as string;

	const {
		data: guild,
		refetch,
		isLoading,
		isError
	} = trpc.guild.byId.useQuery({
		id: guildId
	});
	const mutation = trpc.guild.update.useMutation();

	const changeCurrency = async (guild: Guild, currency: string) => {
		mutation.mutate({ ...guild, currency });
		await refetch();
		toast.success('Currency Symbol Updated');
	};

	if (isLoading || isError) return null;

	return (
		<div className="mt-5 flex items-center justify-between rounded-full bg-base-300 py-3 px-6">
			<div>
				<h1 className="max-w-full cursor-default select-none text-5xl">
					{guild.currency}
				</h1>
			</div>
			<div className="flex items-center justify-center">
				<input type="checkbox" id="currency-modal" className="modal-toggle" />
				<div className="modal">
					<div className="modal-box bg-base-300">
						<label className="label">
							<span className="label-text">Enter A New Currency Symbol</span>
						</label>
						<input
							id="new_currency"
							minLength={1}
							className="input-bordered input mt-5 w-full bg-base-200 text-5xl"
						/>
						<div className="modal-action">
							<label
								htmlFor="currency-modal"
								className="btn btn-success"
								onClick={() =>
									changeCurrency(
										guild,
										(
											document.getElementById(
												'new_currency'
											) as HTMLInputElement
										).value
									)
								}
							>
								Update
							</label>
							<label htmlFor="currency-modal" className="btn btn-warning">
								Cancel
							</label>
						</div>
					</div>
				</div>

				<label className="btn btn-success mr-5" htmlFor="currency-modal">
					Edit
				</label>
				<button
					className="btn btn-error"
					onClick={() => changeCurrency(guild, DefaultCurrencySymbol)}
				>
					Reset
				</button>
			</div>
		</div>
	);
};

CurrencyPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default CurrencyPage;
