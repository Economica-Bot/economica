import {
	APIApplicationCommandInteraction,
	APIMessageComponentInteraction,
	ComponentType,
	InteractionType,
} from 'discord-api-types/v10';
import { verifyKeyMiddleware } from 'discord-interactions';
import express, { raw } from 'express';

import { PUB_KEY } from '../../../config';
import { Context } from '../../../structures';
import commandRoutes from './commands';

const router = express.Router({ mergeParams: true })
	.use(raw({ type: 'application/json' }))
	.use(verifyKeyMiddleware(PUB_KEY))
	.post('/', async (req, res, next) => {
		const interaction = req.body as APIApplicationCommandInteraction | APIMessageComponentInteraction;
		const ctx = await new Context(interaction, res.locals.client).init();
		req.ctx = ctx;
		if (interaction.type === InteractionType.ApplicationCommand) {
			req.url = `/commands/${interaction.data.name}`;
			next();
		} else if (interaction.type === InteractionType.MessageComponent) {
			if (interaction.data.component_type === ComponentType.Button) {
				req.url = interaction.data.custom_id;
				next();
			} else {
				[req.url] = interaction.data.values;
				next();
			}
		}
	})
	.use('/commands', commandRoutes);

export default router;
