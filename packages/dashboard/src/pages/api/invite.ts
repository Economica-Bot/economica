import { inviteQuery } from '@economica/bot/src/config';
import { OAuth2Routes } from 'discord-api-types/v10';
import { NextApiHandler } from 'next';

const handler: NextApiHandler = (req, res) => {
	const query = new URLSearchParams(inviteQuery);
	res.redirect(`${OAuth2Routes.authorizationURL}?${query}`);
};

export default handler;
