import express from 'express';

import { Transaction } from '../../../../entities/index.js';

const router = express.Router();
router.get('/', async (_req, res) => {
	const transactions = await Transaction.find({ where: { guild: { id: res.locals.guild.id } } });
	res.status(200).send(transactions);
});

router.get('/:transactionId', async (req, res) => {
	const { transactionId } = req.params;
	const transaction = await Transaction.findOne({ where: { guild: { id: res.locals.guild.id }, id: transactionId } });
	if (!transaction) {
		res.sendStatus(404);
		return;
	}

	res.status(200).send(transaction);
});

export default router;
