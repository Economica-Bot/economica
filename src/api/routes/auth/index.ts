import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/redirect', passport.authenticate('discord', {
	failureRedirect: 'http://localhost:3001/',
	successRedirect: 'http://localhost:3001/dashboard',
}));

router.get('/status', (req, res) => (req.user ? res.send(req.user) : res.sendStatus(401)));

router.get('/logout', async (req, res) => {
	req.session.destroy(() => {
		req.logout();
		res.redirect('http://localhost:3001');
	});
});

export default router;
