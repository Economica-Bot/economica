import {
	RESTGetAPICurrentUserGuildsResult,
	Routes
} from 'discord-api-types/v10';
import { NextApiHandler } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

import { REST } from '@discordjs/rest';

const rest = new REST({ authPrefix: 'Bearer' });

const handler: NextApiHandler = async (req, res) => {
	const session = await unstable_getServerSession(req, res, authOptions);
	if (!session) return;
	rest.setToken(session!.accessToken);
	const result = (await rest.get(
		Routes.userGuilds()
	)) as RESTGetAPICurrentUserGuildsResult;
	res.json(result);
};

export default handler;
