import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

import type {} from '@skyra/discord-components-core';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { discordMessageOptions } from '../lib/config';
import { trpc } from '../lib/trpc';

const App = ({ Component, pageProps }: AppProps) => {
	useEffect(() => {
		window.$discordMessage = discordMessageOptions;
	}, []);

	return (
		<>
			<ThemeProvider>
				<ToastContainer position="bottom-right" newestOnTop={true} />
				<div className="flex flex-col">
					<SessionProvider session={pageProps.session}>
						<Component {...pageProps} />
					</SessionProvider>
				</div>
			</ThemeProvider>
		</>
	);
};

export default trpc.withTRPC(App);
