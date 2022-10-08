import '../styles/globals.css';
import 'aos/dist/aos.css';
import 'react-toastify/dist/ReactToastify.css';
import type { } from '@skyra/discord-components-core';

import Aos from 'aos';
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';

function MyApp(AppProps: AppProps) {
	useEffect(() => {
		Aos.init({ duration: 1000 });
		window.$discordMessage = {
			profiles: {
				economica: {
					author: 'Economica',
					avatar: '/economica.png',
					roleColor: '#f9d61b',
				},
				adrastopoulos: {
					author: 'Adrastopoulos',
					avatar: '/adrastopoulos.png',
					roleColor: '#0097ff',
				},
			},
			emojis: {
				economica: {
					name: 'economica',
					url: '/economica.png',
				},
			},
		};
	}, []);

	return (
		<>
			<ToastContainer theme="dark" position="bottom-right" newestOnTop={true} />
			<div className='flex-1'>
				<AppProps.Component {...AppProps.pageProps} />
			</div>
		</>
	);
}

export default MyApp;
