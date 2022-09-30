import '../styles/globals.css';
import 'aos/dist/aos.css';
import 'react-toastify/dist/ReactToastify.css';

import Aos from 'aos';
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';

function MyApp(AppProps: AppProps) {
	useEffect(() => {
		Aos.init({ duration: 1000 });
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
