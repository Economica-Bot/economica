import { Request, Response } from 'express';

import { User } from '../../../entities/index.js';
import { getMenuGuildsService } from '../../services/guild.js';

export async function getGuildsController(req: Request, res: Response) {
	const user = req.user as User;
	const guilds = await getMenuGuildsService(user.id);
	res.send(guilds);
}
