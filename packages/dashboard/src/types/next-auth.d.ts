/* eslint-disable @typescript-eslint/no-empty-interface */
import {
	RESTGetAPICurrentUserResult,
	RESTPostOAuth2AccessTokenResult
} from 'discord-api-types/v10';

declare module 'next-auth' {
	interface Account extends RESTPostOAuth2AccessTokenResult {}
	interface Profile extends RESTGetAPICurrentUserResult {}
	interface Session {
		accessToken: string;
		user: RESTGetAPICurrentUserResult;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		accessToken: string;
		profile: RESTGetAPICurrentUserResult;
	}
}
