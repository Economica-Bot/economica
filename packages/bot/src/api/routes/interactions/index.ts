import { APIInteraction, APIPingInteraction, InteractionType } from 'discord-api-types/v10';
import { verifyKeyMiddleware } from 'discord-interactions';
import express, { raw } from 'express';

import { Context } from '../../../structures';
import { bot } from '../../..';
import { PUB_KEY } from '../../../config';

const router = express.Router()
	.use(raw({ type: 'application/json' }), verifyKeyMiddleware(PUB_KEY))
	.post('/', async (req, res, next) => {
		const message = req.body as Exclude<APIInteraction, APIPingInteraction>;
		if (message.type === InteractionType.ApplicationCommand) {
			const ctx = await new Context(message, res.locals.client).init();
			res.locals.ctx = ctx;
			const command = bot.commands.get(message.data.name);
			command.execution(req, res, next);
		}
	});

export default router;
