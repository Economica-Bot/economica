import '../styles/globals.css';
import 'aos/dist/aos.css';
import 'react-toastify/dist/ReactToastify.css';

import Aos from 'aos';
import { RESTGetAPICurrentUserGuildsResult, RESTGetAPICurrentUserResult } from 'discord-api-types/v10';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import { AppContext } from '../context/AppContext';
import { AppPropsWithLayout } from '../lib/types';

function MyApp(AppProps: AppPropsWithLayout<any>) {
	useEffect(() => {
		Aos.init({ duration: 1000 });
	}, []);

	const getLayout = AppProps.Component.getLayout || ((page) => page);

	const [user, setUser] = useState<RESTGetAPICurrentUserResult>();
	const [guilds, setGuilds] = useState<RESTGetAPICurrentUserGuildsResult>([]);

	return (
		<AppContext.Provider value={{ user, setUser, guilds, setGuilds }}>
			<ToastContainer theme="dark" position="bottom-right" newestOnTop={true} />
			{getLayout(<AppProps.Component {...AppProps.pageProps} />)}
		</AppContext.Provider>
	);
}

export default MyApp;
