import { Router } from 'express';

import addMoney from './add-money';
import invite from './invite';
import modulet from './module';
import ping from './ping';
import purge from './purge';

const router = Router();

router
	.use('/add-money', addMoney)
	.use('/invite', invite)
	.use('/module', modulet)
	.use('/ping', ping)
	.use('/purge', purge);

export default router;
