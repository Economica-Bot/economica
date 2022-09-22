import PGStore from 'connect-pg-simple';
import cors from 'cors';
import { json, Router } from 'express';
import session from 'express-session';
import passport from 'passport';

import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME, SECRET } from '../../../config';
import authRoutes from './auth';
import commandRoutes from './commands';
import guildRoutes from './guilds';
import userRoutes from './users';

const router = Router()
	.use(json())
	.use(cors({
		origin: ['http://localhost:3000'],
		credentials: true,
	}))
	.use(session({
		secret: SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7,
		},
		store: new (PGStore(session))({
			conObject: {
				host: DB_HOST,
				port: DB_PORT,
				user: DB_USERNAME,
				password: DB_PASSWORD,
				database: DB_NAME,
			},
		}),
	}))
	.use(passport.initialize())
	.use(passport.session())
	.use('/auth', authRoutes)
	.use('/commands', commandRoutes)
	.use('/guilds', guildRoutes)
	.use('/users', userRoutes);

export default router;
