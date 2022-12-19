import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '../../env.mjs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	res.redirect(env.INVITE_BOT_URL);
}
