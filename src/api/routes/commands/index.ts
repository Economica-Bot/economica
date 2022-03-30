import express from 'express';
import { bot } from '../../../index.js';

const router = express.Router();

router.get('/', (req, res) => {
	const { name } = req.body;
	if (!name) {
		res.status(200).send(bot.commands);
		return;
	}

	const commandData = bot.commands.get(name);
	if (!commandData) {
		res.sendStatus(404);
		return;
	}

	res.status(200).send(commandData);
});

export default router;
