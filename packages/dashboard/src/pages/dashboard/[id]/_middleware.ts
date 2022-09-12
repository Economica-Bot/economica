import { RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
	const headers = req.cookies['connect.sid']
		? { Cookie: `connect.sid=${req.cookies['connect.sid']}` }
		: false;
	if (!headers) return NextResponse.redirect('http://localhost:3001/');
	const auth = await fetch('http://localhost:3001/api/auth/status', {
		headers,
	});
	if (auth.status === 401) return NextResponse.redirect('http://localhost:3001');
	if (!req.page.params) return NextResponse.redirect('http://localhost:3001/dashboard');
	const { id } = req.page.params;
	const res = await fetch('http://localhost:3001/api/users/@me/guilds', {
		headers,
	});
	const guilds = (await res.json()) as RESTGetAPICurrentUserGuildsResult;
	return guilds.some((guild) => guild.id === id)
		? NextResponse.next()
		: NextResponse.redirect('http://localhost:3001/dashboard');
}
