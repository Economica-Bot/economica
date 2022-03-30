import express from 'express';

import { User } from '../../../entities/index.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
	const { userId } = req.params;
	const user = await User.findOne({ where: { id: userId } });
	if (!user) {
		res.sendStatus(404);
		return;
	}

	res.status(200).send(user);
});

export default router;
