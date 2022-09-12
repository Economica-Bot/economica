import { ReactElement } from 'react';

import { useAppContext } from '../../context/AppContext';
import { Footer } from '../misc/Footer';
import { NavBar } from '../misc/NavBar';

export function BaseLayout({ children }: { children: ReactElement }) {
	const { user } = useAppContext();

	return (
		<>
			<NavBar user={user} />
			{children}
			<Footer />
		</>
	);
}
