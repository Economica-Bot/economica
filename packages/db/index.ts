import { DataSource } from 'typeorm';
import * as entityFiles from './entities';
import { env } from './env.mjs';

export const datasource = await new DataSource({
	type: 'postgres',
	url: env.DB_URI,
	entities: Object.values(entityFiles)
}).initialize();
