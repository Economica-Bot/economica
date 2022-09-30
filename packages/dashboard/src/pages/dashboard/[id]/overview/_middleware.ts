import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
	const headers = 'connect.sid' in req.cookies
		? { Cookie: `connect.sid=${req.cookies['connect.sid']}` }
		: false;
	if (!headers) return NextResponse.redirect('http://localhost:3001');
	const auth = await fetch('http://localhost:3000/api/auth/status', {
		headers,
	});
	if (auth.status === 401) return NextResponse.redirect('http://localhost:3001');
	const id = req.page.params?.id;
	if (!id) return NextResponse.redirect('http://localhost:3001/dashboard');
	const res = await fetch(`http://localhost:3000/api/guilds/${id}`, {
		headers,
	});
	if (res.status === 404) return NextResponse.redirect(`http://localhost:3001/dashboard/${id}`);
	return NextResponse.redirect('/');
}
