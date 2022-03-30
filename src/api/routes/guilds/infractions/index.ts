import express from 'express';

import { Infraction } from '../../../../entities/index.js';

const router = express.Router();

router.get('/', async (_req, res) => {
	const infractions = await Infraction.find({ where: { guild: { id: res.locals.guild.id } } });
	res.status(200).send(infractions);
});

router.get('/:infractionId', async (req, res) => {
	const { infractionId } = req.params;
	const infraction = await Infraction.findOne({ where: { guild: { id: res.locals.guild.id }, id: infractionId } });
	if (!infraction) {
		res.sendStatus(404);
		return;
	}

	res.status(200).send(infraction);
});

export default router;
