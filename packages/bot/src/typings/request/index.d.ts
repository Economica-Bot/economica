import { Context } from '../../structures';

export { };

declare global {
	namespace Express {
		export interface Request {
			ctx: Context<any>
		}
	}
}
