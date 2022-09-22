import { APIInteraction, InteractionType } from 'discord-api-types/v10';
import { verifyKeyMiddleware } from 'discord-interactions';
import express, { raw } from 'express';

import { bot } from '../../..';
import { PUB_KEY } from '../../../config';

const router = express.Router()
	.use(raw({ type: 'application/json' }), verifyKeyMiddleware(PUB_KEY))
	.post('/', (req, res, next) => {
		const message = req.body as APIInteraction;
		if (message.type === InteractionType.ApplicationCommand) {
			const command = bot.commands.get(message.data.name);
			command.execution(req, res, next);
		}
	});

export default router;
