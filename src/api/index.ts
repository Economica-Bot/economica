import './utilities/discord';

import PGStore from 'connect-pg-simple';
import cors from 'cors';
import express, { Express } from 'express';
import session from 'express-session';
import passport from 'passport';

import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME, PORT, SECRET } from '../config';
import routes from './routes';

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
					host: DB_HOST,
					port: DB_PORT,
					user: DB_USERNAME,
					password: DB_PASSWORD,
					database: DB_NAME,
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
app.listen(PORT);
