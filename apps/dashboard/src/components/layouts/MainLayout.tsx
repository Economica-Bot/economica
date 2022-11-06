import { FC, PropsWithChildren } from 'react';
import { Footer } from '../misc/Footer';
import { Navbar } from '../misc/Navbar';

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div className="flex min-h-screen min-w-full flex-col">
			<Navbar />
			<div className="grow">{children}</div>
			<Footer />
		</div>
	);
};

export default MainLayout;
