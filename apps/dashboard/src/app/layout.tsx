import '../styles/globals.css';

import AuthContext from './AuthContext';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export interface AccountLayoutProps {
	children: React.ReactNode;
}

export default function MainLayout({ children }: AccountLayoutProps) {
	return (
		<AuthContext>
			<Navbar />
			{children}
			<Footer />
		</AuthContext>
	);
}
