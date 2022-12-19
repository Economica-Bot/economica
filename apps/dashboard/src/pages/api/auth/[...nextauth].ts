import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { env } from '../../../env.mjs';

export const authOptions: NextAuthOptions = {
	providers: [
		DiscordProvider({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
			authorization: { params: { scope: 'identify guilds' } }
		})
	],
	jwt: {
		maxAge: 14 * 24 * 30 * 60 // 2 weeks
	},
	callbacks: {
		jwt: async ({ token, account, profile }) => {
			if (profile) token.profile = profile;
			if (account?.access_token) token.accessToken = account.access_token;
			return token;
		},
		session: async ({ session, token }) => {
			session.accessToken = token.accessToken;
			session.user = token.profile;
			return session;
		}
	},
	theme: { logo: '/economica.png' },
	pages: {
		signIn: '/auth/signin'
	}
};

export default NextAuth(authOptions);
