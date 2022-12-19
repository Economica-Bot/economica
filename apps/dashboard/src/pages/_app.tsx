import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

import type {} from '@skyra/discord-components-core';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { discordMessageOptions } from '../lib/config';
import { trpc } from '../lib/trpc';

export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayoutAndSession = AppProps<{
	session: Session;
}> & {
	Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayoutAndSession) => {
	useEffect(() => {
		window.$discordMessage = discordMessageOptions;
	}, []);

	const getLayout = Component.getLayout ?? ((page) => page);

	return (
		<>
			<ThemeProvider>
				<ToastContainer position="bottom-right" newestOnTop={true} />
				<SessionProvider session={pageProps.session}>
					{getLayout(<Component {...pageProps} />)}
				</SessionProvider>
			</ThemeProvider>
		</>
	);
};

export default trpc.withTRPC(App);
