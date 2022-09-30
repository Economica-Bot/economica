import express from 'express';
import { commandData } from '../../../../lib/commandData';

const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).send(commandData);
});

export default router;
