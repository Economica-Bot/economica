import { NextApiHandler } from 'next';
import { unstable_getServerSession } from 'next-auth';

import { authOptions } from './auth/[...nextauth]';

const handler: NextApiHandler = async (req, res) => {
	const session = await unstable_getServerSession(req, res, authOptions);
	res.json(session);
};

export default handler;
