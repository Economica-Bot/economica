import { FC, PropsWithChildren } from 'react';
import { Footer } from '../misc/Footer';
import { NavBar } from '../misc/NavBar';

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div className="flex min-h-screen min-w-full flex-col">
			<NavBar />
			<div className="grow">{children}</div>
			<Footer />
		</div>
	);
};

export default MainLayout;
