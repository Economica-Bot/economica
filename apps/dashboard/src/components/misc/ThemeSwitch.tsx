import { useTheme } from 'next-themes';

import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

export const ThemeSwitch: React.FC = () => {
	const [mounted, setMounted] = React.useState(false);
	const { theme, setTheme } = useTheme();

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<button
			className="btn btn-ghost"
			onClick={() => {
				if (theme === 'dark') setTheme('light');
				else setTheme('dark');
			}}
		>
			{theme === 'dark' ? (
				<FaMoon className="h-5 w-5" />
			) : (
				<FaSun className="h-5 w-5" />
			)}
		</button>
	);
};
