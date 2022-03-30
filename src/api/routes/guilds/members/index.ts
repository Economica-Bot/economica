import express from 'express';

import { Member } from '../../../../entities/index.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
	const { userId } = req.params;
	const member = await Member.findOne({ where: { guild: { id: res.locals.guild.id }, user: { id: userId } } });
	if (!member) {
		res.sendStatus(404);
		return;
	}

	res.status(200).send(member);
});

export default router;
