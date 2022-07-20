import express, { Express } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import PGStore from 'connect-pg-simple';

import './utilities/discord';
import routes from './routes';
import { PORT, SECRET } from '../config';

export function createApp(): Express {
	const app = express();

	// Enable Parsing Middleware for Requests
	app.use(express.json());

	// Enable CORS
	app.use(
		cors({
			origin: ['http://localhost:3001'],
			credentials: true,
		}),
	);

	// Enable Sessions
	app.use(
		session({
			secret: SECRET,
			resave: false,
			saveUninitialized: false,
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 7,
			},
			store: new (PGStore(session))({
				conObject: {
					host: 'localhost',
					port: 5432,
					user: 'postgres',
					password: 'password',
					database: 'postgres',
				},
			}),
		}),
	);

	// Enable Passport
	app.use(passport.initialize());
	app.use(passport.session());

	// Routes
	app.use('/api', routes);

	return app;
}

const app = createApp();
app.listen(PORT, () => console.log('App Ready'));
