import { DataSource } from 'typeorm';

import * as entityFiles from './entities';

export const datasource = await new DataSource({
	type: 'postgres',
	url: process.env.DB_URL,
	entities: Object.values(entityFiles),
	synchronize: process.env.DB_OPTION === 'sync',
	dropSchema: process.env.DB_OPTION === 'drop',
	useUTC: true
}).initialize();
