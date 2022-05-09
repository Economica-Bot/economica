import passport from 'passport';
import { Profile, Strategy } from 'passport-discord';
import { VerifyCallback } from 'passport-oauth2';

import { Token } from '../../entities/index.js';
import { CALLBACK_URL, CLIENT_ID, CLIENT_SECRET } from '../../config.js';

passport.serializeUser((user: Token, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
	const user = await Token.findOne({ where: { id } });
	if (!user) done(null, null);
	else done(null, user);
});

passport.use(
	new Strategy(
		{
			clientID: CLIENT_ID,
			clientSecret: CLIENT_SECRET,
			callbackURL: CALLBACK_URL,
			scope: ['identify', 'guilds'],
		},
		async (
			accessToken: string,
			refreshToken: string,
			profile: Profile,
			done: VerifyCallback,
		) => {
			await Token.upsert({ id: profile.id, accessToken, refreshToken }, ['id']);
			const user = await Token.findOne({ where: { id: profile.id } });
			done(null, user);
		},
	),
);
