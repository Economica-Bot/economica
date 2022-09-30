import { Infraction } from '@economica/bot/src/entities';
import axios from 'axios';
import { RESTGetAPIGuildChannelsResult, RESTGetAPIUserResult } from 'discord-api-types/v10';
import { GetServerSidePropsContext } from 'next';

import { validateCookies } from './helpers';

export const fetchInfractions = async (ctx: GetServerSidePropsContext) => {
	const headers = validateCookies(ctx);
	if (!headers) return { redirect: { destination: '/' } };
	const { data: infractions } = await axios.get<Infraction[]>(
		`http://localhost:3000/api/guilds/${ctx.query.id}/infractions`,
		{ headers },
	);
	return infractions;
};

export const fetchTransactions = async (ctx: GetServerSidePropsContext) => {
	const headers = validateCookies(ctx);
	if (!headers) return { redirect: { destination: '/' } };
	const { data: transactions } = await axios.get(
		`http://localhost:3000/api/guilds/${ctx.query.id}/transactions`,
		{ headers },
	);
	return transactions;
};

export const fetchUser = async (id: string) => {
	const { data: user } = await axios.get<RESTGetAPIUserResult>(`http://localhost:3000/api/users/${id}`);
	return user;
};

export const fetchChannels = async (id: string) => {
	const { data: user } = await axios.get<RESTGetAPIGuildChannelsResult>(`http://localhost:3000/api/guilds/${id}/channels`);
	return user;
};
