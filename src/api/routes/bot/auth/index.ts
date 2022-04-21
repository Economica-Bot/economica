import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/discord', passport.authenticate('discord'), (_req, res) => {
	res.sendStatus(200);
});

router.get('/discord/redirect', passport.authenticate('discord'), (_req, res) => {
	res.redirect('http://localhost:3001/dashboard');
});

router.get('/status', (req, res) => (req.user ? res.send(req.user) : res.sendStatus(401)));

router.get('/logout', async (req, res) => {
	req.logout();
	res.sendStatus(204);
});

export default router;
