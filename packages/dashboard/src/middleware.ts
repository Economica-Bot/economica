import { RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
	if (req.nextUrl.pathname.startsWith('/dashboard')) {
		const headers = req.cookies['connect.sid']
			? { Cookie: `connect.sid=${req.cookies['connect.sid']}` }
			: false;
		if (!headers) {
			NextResponse.redirect('http://localhost:3001/');
			return;
		}

		const auth = await fetch('http://localhost:3000/api/auth/status', {
			headers,
		});
		if (auth.status === 401) {
			NextResponse.redirect('http://localhost:3001');
			return;
		}

		if (!req.nextUrl.searchParams) {
			NextResponse.redirect('http://localhost:3001/dashboard');
			return;
		}

		const id = req.nextUrl.searchParams.get('id');
		const res = await fetch('http://localhost:3000/api/users/@me/guilds', {
			headers,
		});
		const guilds = (await res.json()) as RESTGetAPICurrentUserGuildsResult;
		if (guilds.some((guild) => guild.id === id)) {
			NextResponse.next();
		} else {
			NextResponse.redirect('http://localhost:3001/dashboard');
		}
	}
}
