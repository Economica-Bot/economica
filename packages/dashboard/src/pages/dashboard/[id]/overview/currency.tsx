import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const CurrencyPage: NextPage = () => {
	const router = useRouter();
	const guildId = router.query.id;

	const [currCurrency, setCurrCurrency] = useState('');
	const [newCurrency, setNewCurrency] = useState('');

	const getCurrency = async () => {
		const { data: currency } = await axios.get(
			`http://localhost:3000/api/guilds/${guildId}/currency`,
		);
		setCurrCurrency(currency);
	};

	const changeCurrency = async () => {
		await axios.put(`http://localhost:3000/api/guilds/${guildId}/currency`, {
			currency: newCurrency,
		});
		toast.success('Currency Symbol Updated');
		getCurrency();
	};

	const resetCurrency = async () => {
		await axios.put(
			`http://localhost:3000/api/guilds/${guildId}/currency/reset`,
		);
		toast.warn('Currency Symbol Reset');
		getCurrency();
	};

	useEffect(() => {
		getCurrency();
	});

	return (
		<>
			<div className="bg-discord-900 mt-5 py-3 px-6 rounded-full flex items-center justify-between">
				<div>
					<h1 className="text-5xl max-w-full cursor-default select-none">
						{currCurrency}
					</h1>
				</div>
				<div className="flex items-center justify-center">
					<label className="btn btn-success mr-5" htmlFor="my-modal">
						Edit
					</label>
					<input type="checkbox" id="my-modal" className="modal-toggle" />
					<div className="modal">
						<div className="modal-box bg-discord-800">
							<label className="label">
								<span className="label-text">Enter A New Currency Symbol</span>
							</label>
							<input
								className="bg-discord-800 text-5xl mt-5 w-full input input-bordered"
								onChange={(e) => setNewCurrency(e.target.value)}
							></input>
							<div className="modal-action">
								<label
									htmlFor="my-modal"
									className="btn"
									onClick={changeCurrency}
								>
									Update
								</label>
								<label htmlFor="my-modal" className="btn">
									Cancel
								</label>
							</div>
						</div>
					</div>

					<button className="btn btn-error" onClick={resetCurrency}>
						Reset
					</button>
				</div>
			</div>
		</>
	);
};

export default CurrencyPage;
