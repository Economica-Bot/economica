import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

import type {} from '@skyra/discord-components-core';
import { NextPage } from 'next';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';
import { ReactElement, ReactNode, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { discordMessageOptions } from '../lib/config';
import { trpc } from '../lib/trpc';

export type NextPageWithLayout<P = Record<string, any>, IP = P> = NextPage<
	P,
	IP
> & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps<{ session: Session }> & {
	Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
	useEffect(() => {
		window.$discordMessage = discordMessageOptions;
	}, []);

	const getLayout = Component.getLayout ?? ((page) => page);

	return (
		<>
			<ThemeProvider>
				<ToastContainer position='bottom-right' newestOnTop={true} />
				<div className='flex flex-col'>
					<SessionProvider session={pageProps.session}>
						{getLayout(<Component {...pageProps} />)}
					</SessionProvider>
				</div>
			</ThemeProvider>
		</>
	);
};

export default trpc.withTRPC(App);
