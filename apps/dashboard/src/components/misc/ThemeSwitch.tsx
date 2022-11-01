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
		<label className="swap btn-ghost swap-rotate btn">
			<input
				type="checkbox"
				checked={theme === 'dark'}
				onChange={() => {
					if (theme === 'dark') setTheme('light');
					else setTheme('dark');
				}}
			/>
			<FaMoon className="swap-on h-5 w-5" />
			<FaSun className="swap-off h-5 w-5" />
		</label>
	);
};
