import { GetServerSidePropsContext } from 'next';
import axios from 'axios';
import { validateCookies } from './helpers';
import { Infraction, User } from './types';

export const fetchInfractions = async (ctx: GetServerSidePropsContext) => {
	const headers = validateCookies(ctx);
	if (!headers) return { redirect: { destination: '/' } };
	const { data: infractions } = await axios.get<Infraction[]>(
		`http://localhost:3001/api/guilds/${ctx.query.id}/infractions`,
		{ headers },
	);
	return infractions;
};

export const fetchTransactions = async (ctx: GetServerSidePropsContext) => {
	const headers = validateCookies(ctx);
	if (!headers) return { redirect: { destination: '/' } };
	const { data: transactions } = await axios.get(
		`http://localhost:3001/api/guilds/${ctx.query.id}/transactions`,
		{ headers },
	);
	return transactions;
};

export const fetchUser = async (id: string) => {
	const { data: user } = await axios.get<User>(`http://localhost:3001/api/users/${id}`);
	return user;
};
