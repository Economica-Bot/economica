import express from 'express';

import interactionRoutes from './interactions';
import protectedRoutes from './protected';

const router = express.Router();

router
	.use('/interactions', interactionRoutes)
	.use(protectedRoutes);

export const routes = router;
