import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

export const authOptions: NextAuthOptions = {
	providers: [
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID as string,
			clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
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
