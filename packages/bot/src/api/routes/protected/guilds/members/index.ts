import express from 'express';

import { Member } from '../../../../../entities';

const router = express.Router();

router.use('/:userId', async (req, res, next) => {
	const { userId } = req.params;
	const member = await Member.findOne({ where: { guild: { id: res.locals.guild.id }, user: { id: userId } } });
	if (!member) {
		res.sendStatus(404);
		return;
	}

	res.locals.member = member;
	next();
});

router.get('/:userId', async (_req, res) => {
	res.send(res.locals.member);
});

router.put('/:userId/balance', async (req, res) => {
	const wallet = req.body.wallet ?? 0;
	const treasury = req.body.treasury ?? 0;

	res.locals.member.wallet += wallet;
	res.locals.member.treasury += treasury;

	await res.locals.member.save();
	res.sendStatus(200);
});

export default router;
