import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/discord', passport.authenticate('discord'), (_req, res) => {
	res.sendStatus(200);
});

router.get('/discord/redirect', passport.authenticate('discord'), (_req, res) => {
	res.sendStatus(200);
});

router.get('/status', (req, res) => (req.user ? res.send(req.user) : res.sendStatus(401)));

export default router;
