import { Context } from './src/structures';

export { };

declare global {
	namespace Express {
		export interface Request {
			ctx: Context
		}
	}
}
